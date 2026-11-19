import { complaints, employers, jobs as seedJobs, workers } from "../data/mock";
import type { AdminStats, Complaint, Job, Rating, Worker } from "../types";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
const wait = () => new Promise((resolve) => setTimeout(resolve, 350));
const readJobs = (): Job[] =>
  JSON.parse(localStorage.getItem("shram-jobs") ?? JSON.stringify(seedJobs));
const writeJobs = (jobs: Job[]) => localStorage.setItem("shram-jobs", JSON.stringify(jobs));

/** Future endpoint: GET /api/jobs */
export async function getJobs(): Promise<Job[]> {
  await wait();
  return readJobs();
}

/** Future endpoint: GET /api/workers */
export async function getWorkers(): Promise<Worker[]> {
  await wait();
  return workers;
}

/** Future endpoint: POST /api/jobs */
export async function postJob(job: Omit<Job, "id">): Promise<Job> {
  await wait();
  const created = { ...job, id: `j-${Date.now()}` };
  writeJobs([created, ...readJobs()]);
  return created;
}

/** Future endpoint: POST /api/jobs/:id/accept */
export async function acceptJob(jobId: string): Promise<void> {
  await wait();
  writeJobs(
    readJobs().map((job) => (job.id === jobId ? { ...job, status: "Worker accepted" } : job)),
  );
}

/** Future endpoint: POST /api/jobs/:id/reject */
export async function rejectJob(jobId: string): Promise<void> {
  await wait();
  localStorage.setItem(
    "shram-rejected",
    JSON.stringify([...JSON.parse(localStorage.getItem("shram-rejected") ?? "[]"), jobId]),
  );
}

/** Future endpoint: POST /api/ratings */
export async function submitRating(rating: Rating): Promise<void> {
  await wait();
  localStorage.setItem(
    "shram-ratings",
    JSON.stringify([...JSON.parse(localStorage.getItem("shram-ratings") ?? "[]"), rating]),
  );
}

/** Future endpoint: POST /api/complaints */
export async function reportComplaint(complaint: Complaint): Promise<void> {
  await wait();
  localStorage.setItem(
    "shram-complaints",
    JSON.stringify([
      ...JSON.parse(localStorage.getItem("shram-complaints") ?? JSON.stringify(complaints)),
      complaint,
    ]),
  );
}

/** Future endpoint: GET /api/admin/stats */
export async function getAdminStats(): Promise<AdminStats> {
  await wait();
  const allJobs = readJobs();
  return {
    workers: workers.length,
    employers: employers.length,
    jobsPosted: allJobs.length,
    jobsFilled: allJobs.filter((job) => job.status !== "Open").length + 7,
    avgMatchMinutes: 18,
  };
}
