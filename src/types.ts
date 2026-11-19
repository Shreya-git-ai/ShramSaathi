export type Skill =
  | "mason"
  | "painter"
  | "carpenter"
  | "plumber"
  | "electrician"
  | "helper"
  | "loader"
  | "driver"
  | "welder"
  | "tile-layer"
  | "gardener"
  | "cleaner"
  | "plasterer";

export type Area = {
  name: string;
  lat: number;
  lng: number;
};

export type Worker = {
  id: string;
  name: string;
  avatar: string;
  skills: Skill[];
  area: Area;
  maxTravelKm: number;
  expectedWage: number;
  rating: number;
  jobsCompleted: number;
  verified: boolean;
  availableDates: string[];
  phone: string;
};

export type Employer = {
  id: string;
  name: string;
  type: "Household" | "Contractor" | "Small business";
  rating: number;
  verified: boolean;
  phone: string;
};

export type JobStatus = "Open" | "Worker accepted" | "In progress" | "Completed";

export type Job = {
  id: string;
  title: string;
  skills: Skill[];
  area: Area;
  date: string;
  duration: string;
  wage: number;
  workersNeeded: number;
  employerId: string;
  employerName: string;
  employerRating: number;
  employerVerified: boolean;
  description: string;
  status: JobStatus;
};

export type Rating = {
  id: string;
  fromId: string;
  toId: string;
  jobId: string;
  stars: number;
};

export type Complaint = {
  id: string;
  jobId: string;
  reporterName: string;
  reason: string;
  status: "Open" | "Resolved";
};

export type AdminStats = {
  workers: number;
  employers: number;
  jobsPosted: number;
  jobsFilled: number;
  avgMatchMinutes: number;
};
