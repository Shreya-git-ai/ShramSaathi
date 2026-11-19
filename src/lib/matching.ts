import { jobs, workers } from "../data/mock";
import type { Job, Skill, Worker } from "../types";

export const RELATED_SKILLS: Partial<Record<Skill, Partial<Record<Skill, number>>>> = {
  mason: { "tile-layer": 0.6, helper: 0.3 },
  "tile-layer": { mason: 0.6, helper: 0.3 },
  helper: { mason: 0.3, "tile-layer": 0.3, loader: 0.5 },
  loader: { helper: 0.5 },
  painter: { plasterer: 0.6 },
  plasterer: { painter: 0.6 },
  electrician: { welder: 0.3 },
  welder: { electrician: 0.3 },
};

export type MatchBreakdown = {
  skill: number;
  distance: number;
  wage: number;
  availability: number;
  rating: number;
  distanceKm: number;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const radians = (value: number) => (value * Math.PI) / 180;

export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadius = 6371;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function skillScore(jobSkills: Skill[], workerSkills: Skill[]) {
  if (!jobSkills.length) return 0;
  const weightedIntersection = jobSkills.reduce((sum, needed) => {
    if (workerSkills.includes(needed)) return sum + 1;
    const partial = Math.max(
      0,
      ...workerSkills.map((owned) => RELATED_SKILLS[needed]?.[owned] ?? 0),
    );
    return sum + partial;
  }, 0);
  const weightedUnion = jobSkills.length + workerSkills.length - weightedIntersection;
  return weightedUnion ? weightedIntersection / weightedUnion : 0;
}

export function scoreWorker(job: Job, worker: Worker) {
  const distanceKm = haversine(job.area, worker.area);
  const breakdown: MatchBreakdown = {
    skill: clamp(skillScore(job.skills, worker.skills)),
    distance: clamp(1 - distanceKm / worker.maxTravelKm),
    wage: clamp(job.wage / worker.expectedWage),
    availability: worker.availableDates.includes(job.date) ? 1 : 0,
    rating: worker.rating / 5,
    distanceKm,
  };
  const total = Math.round(
    100 *
      (breakdown.skill * 0.35 +
        breakdown.distance * 0.25 +
        breakdown.wage * 0.15 +
        breakdown.availability * 0.15 +
        breakdown.rating * 0.1),
  );
  const reasons = [
    breakdown.skill >= 0.8 ? `Has ${job.skills[0].replace("-", " ")} skill` : "Has a related skill",
    `${distanceKm.toFixed(1)} km away`,
    job.wage >= worker.expectedWage
      ? "Pay meets expected wage"
      : `Offer is ₹${job.wage} vs ₹${worker.expectedWage} expected`,
    breakdown.availability ? "Free on this day" : "Availability not confirmed",
    `${worker.rating.toFixed(1)}★ rated`,
  ];
  return { total, breakdown, reasons };
}

export function rankWorkers(job: Job, list: Worker[] = workers) {
  return list
    .map((worker) => ({ worker, score: scoreWorker(job, worker) }))
    .sort((a, b) => b.score.total - a.score.total);
}

export function rankJobsForWorker(worker: Worker, list: Job[] = jobs) {
  return list
    .map((job) => ({ job, score: scoreWorker(job, worker) }))
    .sort((a, b) => b.score.total - a.score.total);
}
