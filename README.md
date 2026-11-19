# ShramSaathi

**Local Job & Skill Matching Portal for Daily-Wage Workers**

> Work near you. Fair pay. Today.

ShramSaathi is a responsive web application that connects unskilled and semi-skilled daily-wage workers (masons, painters, carpenters, plumbers, electricians, helpers, loaders and drivers) with nearby short-term jobs. Workers declare their skills, location and availability using icons instead of résumés. Employers (contractors, households and small businesses) post jobs in a few taps, and a transparent matching algorithm ranks the best-suited workers and explains why.

*Project Problem No. 50, Community Project.*

---

## Why this project

Most daily-wage workers find work through contractors, personal contacts and word of mouth. Workers who miss out lose a day's income, and those who depend on one middleman often earn below the market rate. Mainstream job portals are built around résumés, permanent roles and text-heavy screens, so they don't serve this workforce.

ShramSaathi addresses the gaps found in our literature survey:

| Gap | How ShramSaathi responds |
|---|---|
| Portals focus on permanent jobs | Short-term, same-day and few-day job postings |
| Hard to enter skills in text | Icon-based skill selection (30–40 manual skills) |
| Weak location-based matching | Distance is a core factor in the match score |
| Language and accessibility barriers | Multi-language UI (English / Kannada / Hindi) and voice-help affordances |
| Not enough job postings | Quick post-job flow for employers |
| Lack of trust and wage transparency | Wages shown clearly, user verification, two-way ratings, complaint reporting |
| Opaque or biased matching | Weighted, explainable score with a "why recommended" breakdown |
| Little real-world testing | Pilot testing with workers and employers in Bengaluru |

## Features

**Worker module**
- Three-step profile setup: pick skills from icon tiles, set area and travel distance, set expected daily wage and availability
- Job feed sorted by match score, showing wage, distance, date, duration and employer rating
- Accept or reject jobs, view "why this job suits you"
- Rate employers after work, report problems

**Employer module**
- Post a job with skills, location, date, duration, wage and number of workers
- Ranked list of suitable workers with a match score and breakdown
- Shortlist workers and send requests; contact details stay masked until the worker accepts
- Track job status and rate workers after completion

**Admin module**
- Platform statistics and user verification queue
- Complaint handling
- Comparison of the weighted matching against distance-only and skill-only baselines

## Matching algorithm

When a job is posted, each worker is scored out of 100 using a weighted sum:

| Factor | Weight | How it is calculated |
|---|---|---|
| Skill match | 35% | Skill overlap, with partial credit for related skills |
| Distance | 25% | Based on distance between worker and job (haversine), relative to the worker's travel limit |
| Wage match | 15% | Full score if the offered wage meets the worker's expectation, reduced proportionally otherwise |
| Availability | 15% | Whether the worker is free on the job date |
| Rating | 10% | Employer ratings out of 5 |

The app shows each factor's contribution and a plain-language reason (for example, "has plastering skill, 1.2 km away, wage fits, free on Saturday") so workers and employers can see why someone is recommended.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS, HTML/CSS/JavaScript |
| Backend (planned) | Python, Flask / FastAPI |
| Database (planned) | PostgreSQL |
| AI/ML | Python AI/ML libraries (related-skill identification) |
| Tools | VS Code, GitHub |

**Current status:** the frontend prototype runs on mock data (stored in `src/data/` and the browser's localStorage), including a working matching function. All data access goes through a single module, `src/lib/api.ts`, so it can be pointed at the Flask/FastAPI backend later without rewriting the UI.

## Getting started

### Prerequisites
- Node.js 18 or later
- npm

### Run locally

```bash
git clone <your-repo-url>
cd shramsaathi
npm install
npm run dev
```

Then open the local URL shown in the terminal (usually `http://localhost:5173`). To view it on a phone, open the same URL from a device on the same network, or use your browser's device toolbar.

### Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
shramsaathi/
├── src/
│   ├── components/     # Reusable UI (skill tiles, job cards, worker cards, score ring)
│   ├── pages/          # Worker, Employer and Admin screens
│   ├── data/           # Mock workers, employers and jobs
│   ├── lib/
│   │   ├── matching.ts # Weighted scoring and ranking
│   │   └── api.ts      # Data access layer (mock now, REST later)
│   ├── types.ts        # Worker, Employer, Job, Rating, Complaint
│   └── main.tsx
├── public/
├── package.json
└── README.md
```

The exact layout may differ slightly depending on how the project was generated.

## Connecting a backend (planned)

1. Build the Flask/FastAPI service with endpoints such as `GET /api/jobs`, `POST /api/jobs`, `GET /api/workers` and `POST /api/ratings`
2. Enable CORS for the frontend origin
3. Create a `.env` file in the frontend root with `VITE_API_URL=http://localhost:8000`
4. Replace the mock implementations in `src/lib/api.ts` with `fetch` calls to those endpoints
5. Move the matching logic to Python on the server, or call it from the API

## Trust, safety and data protection

- Secure login and user verification
- Two-way ratings and complaint reporting
- Wages visible on every job
- Contact details shared only after a worker accepts
- Access controls on personal information

## Evaluation plan

The matching algorithm will be compared with distance-only and skill-only baselines using:
- Matching accuracy
- Distance between workers and job locations
- Time taken to find suitable workers
- Job completion and user feedback from a pilot with workers and employers in selected areas of Bengaluru

## Alignment with SDG and Program Outcomes

- **SDG 8, Decent Work and Economic Growth:** supports livelihoods of daily-wage workers
- **PO6, Engineer and Society:** addresses a real-world employment problem
- **PO8, Ethics:** fair access to work, wage transparency and responsible handling of user data

## Roadmap

- Connect the Flask/FastAPI backend and PostgreSQL
- Voice input for profile setup
- More job categories and cities
- Installable PWA for easier access on phones



## License

Developed for academic purposes. Add a license here if you plan to open-source the project.