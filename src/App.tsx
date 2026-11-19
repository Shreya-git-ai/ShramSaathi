import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Droplets,
  Hammer,
  HardHat,
  Headphones,
  Home,
  Leaf,
  LoaderCircle,
  MapPin,
  Mic,
  Minus,
  Paintbrush,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UserRound,
  UsersRound,
  Volume2,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AREAS,
  complaints as seedComplaints,
  employers,
  jobs as seedJobs,
  workers as seedWorkers,
} from "./data/mock";
import { acceptJob, getAdminStats, getJobs, getWorkers, postJob, rejectJob } from "./lib/api";
import { rankJobsForWorker, rankWorkers, scoreWorker, type MatchBreakdown } from "./lib/matching";
import type { AdminStats, Job, Skill, Worker } from "./types";

type Role = "landing" | "worker" | "employer" | "admin";
type Language = "en" | "kn" | "hi";
type Icon = ComponentType<{ className?: string; strokeWidth?: number }>;

const SKILLS: { id: Skill; label: string; icon: Icon }[] = [
  { id: "mason", label: "Mason", icon: Building2 },
  { id: "painter", label: "Painter", icon: Paintbrush },
  { id: "carpenter", label: "Carpenter", icon: Hammer },
  { id: "plumber", label: "Plumber", icon: Droplets },
  { id: "electrician", label: "Electrician", icon: Zap },
  { id: "helper", label: "Helper", icon: UsersRound },
  { id: "loader", label: "Loader", icon: Truck },
  { id: "driver", label: "Driver", icon: Car },
  { id: "welder", label: "Welder", icon: Sparkles },
  { id: "tile-layer", label: "Tile-layer", icon: Wrench },
  { id: "gardener", label: "Gardener", icon: Leaf },
  { id: "cleaner", label: "Cleaner", icon: Home },
];

const copy = {
  en: {
    tagline: "Work near you. Fair pay. Today.",
    worker: "Worker",
    employer: "Employer",
    admin: "Admin",
    stepWork: "What work do you do?",
    stepWhere: "Where are you?",
    stepWage: "Daily wage & availability",
    chooseMany: "Choose one or more",
    continue: "Continue",
    back: "Back",
    useLocation: "Use my location",
    chooseArea: "Choose your area",
    travel: "How far can you travel?",
    expected: "Expected daily wage",
    available: "Days you are free",
    finish: "Show me jobs",
    jobs: "Jobs",
    profile: "Profile",
    myWork: "My Work",
    nearYou: "Jobs near you",
    bestFirst: "Best matches first",
    today: "Today",
    within: "Within 5 km",
    highest: "Highest pay",
    accept: "Accept",
    reject: "Reject",
    details: "See details",
    suits: "Why this job suits you",
    employerLabel: "Employer",
    report: "Report a problem",
    upcoming: "Upcoming",
    completed: "Completed",
    noWork: "No jobs here yet",
  },
  kn: {
    tagline: "ನಿಮ್ಮ ಹತ್ತಿರ ಕೆಲಸ. ನ್ಯಾಯವಾದ ಕೂಲಿ. ಇಂದೇ.",
    worker: "ಕಾರ್ಮಿಕ",
    employer: "ಉದ್ಯೋಗದಾತ",
    admin: "ನಿರ್ವಾಹಕ",
    stepWork: "ನೀವು ಯಾವ ಕೆಲಸ ಮಾಡುತ್ತೀರಿ?",
    stepWhere: "ನೀವು ಎಲ್ಲಿದ್ದೀರಿ?",
    stepWage: "ದಿನಗೂಲಿ ಮತ್ತು ಲಭ್ಯತೆ",
    chooseMany: "ಒಂದು ಅಥವಾ ಹೆಚ್ಚು ಆಯ್ಕೆಮಾಡಿ",
    continue: "ಮುಂದೆ",
    back: "ಹಿಂದೆ",
    useLocation: "ನನ್ನ ಸ್ಥಳ ಬಳಸಿ",
    chooseArea: "ನಿಮ್ಮ ಪ್ರದೇಶ ಆಯ್ಕೆಮಾಡಿ",
    travel: "ಎಷ್ಟು ದೂರ ಹೋಗಬಹುದು?",
    expected: "ನಿರೀಕ್ಷಿತ ದಿನಗೂಲಿ",
    available: "ನೀವು ಖಾಲಿ ಇರುವ ದಿನಗಳು",
    finish: "ಕೆಲಸಗಳನ್ನು ತೋರಿಸಿ",
    jobs: "ಕೆಲಸಗಳು",
    profile: "ಪ್ರೊಫೈಲ್",
    myWork: "ನನ್ನ ಕೆಲಸ",
    nearYou: "ನಿಮ್ಮ ಹತ್ತಿರದ ಕೆಲಸಗಳು",
    bestFirst: "ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ ಮೊದಲು",
    today: "ಇಂದು",
    within: "5 ಕಿಮೀ ಒಳಗೆ",
    highest: "ಹೆಚ್ಚಿನ ಕೂಲಿ",
    accept: "ಒಪ್ಪಿಕೊಳ್ಳಿ",
    reject: "ಬೇಡ",
    details: "ವಿವರ ನೋಡಿ",
    suits: "ಈ ಕೆಲಸ ನಿಮಗೆ ಏಕೆ ಸೂಕ್ತ",
    employerLabel: "ಉದ್ಯೋಗದಾತ",
    report: "ಸಮಸ್ಯೆ ತಿಳಿಸಿ",
    upcoming: "ಮುಂದಿನ",
    completed: "ಮುಗಿದ",
    noWork: "ಇನ್ನೂ ಕೆಲಸಗಳಿಲ್ಲ",
  },
  hi: {
    tagline: "पास में काम। सही दाम। आज ही।",
    worker: "कामगार",
    employer: "नियोक्ता",
    admin: "एडमिन",
    stepWork: "आप क्या काम करते हैं?",
    stepWhere: "आप कहाँ हैं?",
    stepWage: "दिहाड़ी और उपलब्धता",
    chooseMany: "एक या अधिक चुनें",
    continue: "आगे",
    back: "पीछे",
    useLocation: "मेरी जगह चुनें",
    chooseArea: "अपना इलाका चुनें",
    travel: "कितनी दूर जा सकते हैं?",
    expected: "अपेक्षित दिहाड़ी",
    available: "जिन दिनों आप खाली हैं",
    finish: "काम दिखाएँ",
    jobs: "काम",
    profile: "प्रोफ़ाइल",
    myWork: "मेरा काम",
    nearYou: "आपके पास काम",
    bestFirst: "सबसे अच्छे मेल पहले",
    today: "आज",
    within: "5 किमी के अंदर",
    highest: "सबसे अधिक दाम",
    accept: "स्वीकार",
    reject: "छोड़ें",
    details: "पूरी जानकारी",
    suits: "यह काम आपके लिए सही क्यों है",
    employerLabel: "नियोक्ता",
    report: "समस्या बताएँ",
    upcoming: "आने वाले",
    completed: "पूरे हुए",
    noWork: "अभी कोई काम नहीं",
  },
};

const today = new Date().toISOString().slice(0, 10);
const futureDate = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};
const prettyDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(`${date}T10:00:00`),
  );
const labelSkill = (skill: Skill) => SKILLS.find((item) => item.id === skill)?.label ?? skill;
const getSkillIcon = (skill: Skill) => SKILLS.find((item) => item.id === skill)?.icon ?? Wrench;

function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
}) {
  const variants = {
    primary: "bg-[#2B2D6E] text-white hover:bg-[#202253] shadow-[0_6px_16px_rgba(43,45,110,.18)]",
    secondary: "bg-white text-[#2B2D6E] border-2 border-[#DFE0EC] hover:border-[#2B2D6E]",
    success: "bg-[#16855B] text-white hover:bg-[#116B49]",
    danger: "bg-[#FFF1EF] text-[#B42318] border-2 border-[#F6C4BE] hover:bg-[#FFE7E4]",
    ghost: "bg-transparent text-[#2B2D6E] hover:bg-[#EEEFF7]",
  };
  return (
    <button
      className={`min-h-14 rounded-2xl px-5 font-bold transition active:scale-[.98] disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function LanguageToggle({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  return (
    <div
      className="flex rounded-xl bg-white/90 p-1 shadow-sm ring-1 ring-black/5"
      aria-label="Choose language"
    >
      {(["en", "kn", "hi"] as Language[]).map((key) => (
        <button
          key={key}
          onClick={() => setLanguage(key)}
          className={`min-h-10 min-w-12 rounded-lg px-2 text-sm font-bold transition ${language === key ? "bg-[#2B2D6E] text-white" : "text-[#57576B]"}`}
          aria-pressed={language === key}
        >
          {key === "en" ? "EN" : key === "kn" ? "ಕ" : "हि"}
        </button>
      ))}
    </div>
  );
}

function VoiceButton({ label = "Voice help" }: { label?: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#FFF0C9] text-[#8A5700] transition hover:bg-[#FFE29A]"
    >
      <Volume2 className="size-6" strokeWidth={2.5} />
    </button>
  );
}

function AppHeader({
  language,
  setLanguage,
  onBack,
  title,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  onBack?: () => void;
  title?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E8E2DA] bg-[#FFFBF5]/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="grid size-11 place-items-center rounded-xl bg-white text-[#2B2D6E]"
            >
              <ChevronLeft />
            </button>
          )}
          <div className="grid size-10 place-items-center rounded-xl bg-[#F59E0B] text-[#2B2D6E]">
            <HardHat className="size-6" strokeWidth={2.7} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black leading-none text-[#2B2D6E]">
              {title ?? "ShramSaathi"}
            </p>
            {!title && (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#777184]">
                ಶ್ರಮ ಸಾಥಿ
              </p>
            )}
          </div>
        </div>
        <LanguageToggle language={language} setLanguage={setLanguage} />
      </div>
    </header>
  );
}

function SkillGrid({
  selected,
  onToggle,
}: {
  selected: Skill[];
  onToggle: (skill: Skill) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {SKILLS.map(({ id, label, icon: SkillIcon }) => {
        const active = selected.includes(id);
        return (
          <button
            key={id}
            onClick={() => onToggle(id)}
            aria-pressed={active}
            className={`relative flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 px-2 transition active:scale-95 ${active ? "border-[#2B2D6E] bg-[#EEEFFB] text-[#2B2D6E]" : "border-[#E7E0D7] bg-white text-[#494657]"}`}
          >
            <span
              className={`grid size-12 place-items-center rounded-xl ${active ? "bg-[#2B2D6E] text-white" : "bg-[#FFF3D6] text-[#8A5700]"}`}
            >
              <SkillIcon className="size-7" strokeWidth={2.4} />
            </span>
            <span className="text-sm font-extrabold leading-tight">{label}</span>
            {active && (
              <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-[#16855B] text-white">
                <Check className="size-4" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ScoreRing({ score, size = "large" }: { score: number; size?: "small" | "large" }) {
  const color = score >= 80 ? "#16855B" : score >= 60 ? "#F59E0B" : "#C76B12";
  return (
    <div
      className={`score-ring ${size === "large" ? "size-[74px]" : "size-14"}`}
      style={{ "--score": `${score * 3.6}deg`, "--ring": color } as React.CSSProperties}
      aria-label={`${score}% match`}
    >
      <span className={size === "large" ? "text-base" : "text-xs"}>{score}%</span>
      {size === "large" && <small>match</small>}
    </div>
  );
}

function Landing({
  language,
  setLanguage,
  onRole,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  onRole: (role: Role) => void;
}) {
  const t = copy[language];
  const roles = [
    {
      role: "worker" as Role,
      label: t.worker,
      note:
        language === "en"
          ? "Find work near you"
          : language === "kn"
            ? "ಹತ್ತಿರದ ಕೆಲಸ ಹುಡುಕಿ"
            : "पास में काम पाएँ",
      icon: HardHat,
      color: "bg-[#2B2D6E] text-white",
    },
    {
      role: "employer" as Role,
      label: t.employer,
      note:
        language === "en"
          ? "Find trusted workers"
          : language === "kn"
            ? "ವಿಶ್ವಾಸಾರ್ಹ ಕಾರ್ಮಿಕರು"
            : "भरोसेमंद कामगार पाएँ",
      icon: BriefcaseBusiness,
      color: "bg-[#F59E0B] text-[#332000]",
    },
    {
      role: "admin" as Role,
      label: t.admin,
      note:
        language === "en"
          ? "Safety & support"
          : language === "kn"
            ? "ಸುರಕ್ಷತೆ ಮತ್ತು ಸಹಾಯ"
            : "सुरक्षा और सहायता",
      icon: ShieldCheck,
      color: "bg-white text-[#2B2D6E] border-2 border-[#D9D9E8]",
    },
  ];
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFBF5] px-5 py-6">
      <div className="absolute -right-28 -top-20 size-72 rounded-full bg-[#FFE8AF]" />
      <div className="absolute -bottom-36 -left-32 size-80 rounded-full bg-[#E4E5F4]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col">
        <div className="flex justify-end">
          <LanguageToggle language={language} setLanguage={setLanguage} />
        </div>
        <div className="mt-8 flex flex-1 flex-col justify-center">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid size-24 place-items-center rounded-[2rem] bg-[#2B2D6E] text-[#F59E0B] shadow-[0_12px_28px_rgba(43,45,110,.22)]">
              <HardHat className="size-14" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#2B2D6E]">ShramSaathi</h1>
            <p className="mt-2 text-sm font-bold text-[#8A5700]">ಶ್ರಮ ಸಾಥಿ • श्रम साथी</p>
            <p className="mx-auto mt-4 max-w-xs text-xl font-extrabold leading-snug text-[#373346]">
              {t.tagline}
            </p>
          </div>
          <div className="space-y-3">
            {roles.map(({ role, label, note, icon: RoleIcon, color }) => (
              <button
                key={role}
                onClick={() => onRole(role)}
                className={`flex min-h-[84px] w-full items-center gap-4 rounded-2xl px-5 text-left shadow-[0_6px_18px_rgba(50,45,35,.08)] transition hover:-translate-y-0.5 active:scale-[.99] ${color}`}
              >
                <span className="grid size-12 place-items-center rounded-xl bg-white/20">
                  <RoleIcon className="size-7" strokeWidth={2.6} />
                </span>
                <span>
                  <strong className="block text-xl">{label}</strong>
                  <span className="text-sm font-semibold opacity-75">{note}</span>
                </span>
                <ChevronLeft className="ml-auto rotate-180 opacity-70" />
              </button>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-xs font-semibold text-[#777184]">
          Demo app • No login needed
        </p>
      </div>
    </main>
  );
}

type ProfileDraft = {
  skills: Skill[];
  areaName: string;
  maxTravelKm: number;
  expectedWage: number;
  availableDates: string[];
};

function WorkerSetup({
  language,
  setLanguage,
  onDone,
  onExit,
}: {
  language: Language;
  setLanguage: (l: Language) => void;
  onDone: (draft: ProfileDraft) => void;
  onExit: () => void;
}) {
  const t = copy[language];
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProfileDraft>({
    skills: [],
    areaName: "Hebbal",
    maxTravelKm: 10,
    expectedWage: 750,
    availableDates: [today, futureDate(1), futureDate(2)],
  });
  const titles = [t.stepWork, t.stepWhere, t.stepWage];
  const dayLabels =
    language === "kn"
      ? ["ಇಂದು", "ನಾಳೆ", "ಬುಧ", "ಗುರು", "ಶುಕ್ರ", "ಶನಿ", "ಭಾನು"]
      : language === "hi"
        ? ["आज", "कल", "बुध", "गुरु", "शुक्र", "शनि", "रवि"]
        : ["Today", "Tomorrow", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const canContinue = step > 0 || draft.skills.length > 0;
  return (
    <div className="min-h-screen bg-[#FFFBF5] pb-28">
      <AppHeader
        language={language}
        setLanguage={setLanguage}
        onBack={step ? () => setStep(step - 1) : onExit}
      />
      <main className="mx-auto max-w-xl px-4 pt-6">
        <div className="mb-6 flex items-center justify-center gap-2">
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className={`h-2.5 rounded-full transition-all ${item === step ? "w-10 bg-[#F59E0B]" : item < step ? "w-4 bg-[#16855B]" : "w-4 bg-[#D9D5CF]"}`}
            />
          ))}
        </div>
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-bold text-[#8A5700]">Step {step + 1} of 3</p>
            <h2 className="text-2xl font-black text-[#292643]">{titles[step]}</h2>
            {step === 0 && <p className="mt-2 font-semibold text-[#716B78]">{t.chooseMany}</p>}
          </div>
          <VoiceButton />
        </div>
        {step === 0 && (
          <SkillGrid
            selected={draft.skills}
            onToggle={(skill) =>
              setDraft({
                ...draft,
                skills: draft.skills.includes(skill)
                  ? draft.skills.filter((item) => item !== skill)
                  : [...draft.skills, skill],
              })
            }
          />
        )}
        {step === 1 && (
          <div className="space-y-6">
            <Button
              className="flex w-full items-center justify-center gap-2"
              onClick={() => setDraft({ ...draft, areaName: "Hebbal" })}
            >
              <MapPin className="size-6" /> {t.useLocation}
            </Button>
            <section>
              <h3 className="mb-3 text-lg font-extrabold text-[#343145]">{t.chooseArea}</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(AREAS).map((area) => (
                  <button
                    key={area}
                    onClick={() => setDraft({ ...draft, areaName: area })}
                    className={`min-h-16 rounded-2xl border-2 px-3 font-bold ${draft.areaName === area ? "border-[#2B2D6E] bg-[#EEEFFB] text-[#2B2D6E]" : "border-[#E6DFD6] bg-white text-[#4E4A57]"}`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E9E2D8]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-extrabold">{t.travel}</h3>
                <strong className="rounded-xl bg-[#FFF0C9] px-3 py-2 text-[#754A00]">
                  {draft.maxTravelKm} km
                </strong>
              </div>
              <input
                aria-label={t.travel}
                type="range"
                min="1"
                max="15"
                value={draft.maxTravelKm}
                onChange={(event) => setDraft({ ...draft, maxTravelKm: +event.target.value })}
                className="w-full accent-[#2B2D6E]"
              />
              <div className="mt-2 flex justify-between text-xs font-bold text-[#7B7580]">
                <span>1 km</span>
                <span>15 km</span>
              </div>
            </section>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-7">
            <section className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-[#E9E2D8]">
              <h3 className="font-extrabold text-[#4A4653]">{t.expected}</h3>
              <p className="my-4 text-5xl font-black text-[#16855B]">₹{draft.expectedWage}</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  aria-label="Reduce wage"
                  onClick={() =>
                    setDraft({ ...draft, expectedWage: Math.max(300, draft.expectedWage - 50) })
                  }
                  className="grid size-14 place-items-center rounded-2xl bg-[#EEEFF7] text-[#2B2D6E]"
                >
                  <Minus />
                </button>
                <span className="font-bold text-[#777184]">₹50</span>
                <button
                  aria-label="Increase wage"
                  onClick={() =>
                    setDraft({ ...draft, expectedWage: Math.min(1500, draft.expectedWage + 50) })
                  }
                  className="grid size-14 place-items-center rounded-2xl bg-[#2B2D6E] text-white"
                >
                  <Plus />
                </button>
              </div>
            </section>
            <section>
              <h3 className="mb-3 text-lg font-extrabold">{t.available}</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dayLabels.map((label, index) => {
                  const date = futureDate(index);
                  const active = draft.availableDates.includes(date);
                  return (
                    <button
                      key={date}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          availableDates: active
                            ? draft.availableDates.filter((item) => item !== date)
                            : [...draft.availableDates, date],
                        })
                      }
                      className={`flex min-h-20 min-w-[74px] flex-col items-center justify-center rounded-2xl border-2 px-2 font-bold ${active ? "border-[#16855B] bg-[#E9F8F1] text-[#116B49]" : "border-[#E4DED5] bg-white text-[#6B6572]"}`}
                    >
                      <span className="text-xs">{label}</span>
                      <span className="mt-1 text-xl">{new Date(`${date}T10:00:00`).getDate()}</span>
                      {active && <Check className="mt-1 size-4" />}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E2DCD4] bg-[#FFFBF5]/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              {t.back}
            </Button>
          )}
          <Button
            className="flex flex-1 items-center justify-center gap-2"
            disabled={!canContinue}
            onClick={() => (step < 2 ? setStep(step + 1) : onDone(draft))}
          >
            {step === 2 ? t.finish : t.continue}
            <ChevronLeft className="size-5 rotate-180" />
          </Button>
          <VoiceButton />
        </div>
      </div>
    </div>
  );
}

function WorkerBottomNav({
  active,
  setActive,
  t,
}: {
  active: string;
  setActive: (tab: string) => void;
  t: typeof copy.en;
}) {
  const tabs = [
    { id: "jobs", label: t.jobs, icon: BriefcaseBusiness },
    { id: "profile", label: t.profile, icon: UserRound },
    { id: "work", label: t.myWork, icon: CalendarDays },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#DFD9D1] bg-white px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto flex max-w-xl justify-around">
        {tabs.map(({ id, label, icon: TabIcon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex min-h-14 min-w-24 flex-col items-center justify-center rounded-xl text-xs font-extrabold ${active === id ? "bg-[#EEEFFB] text-[#2B2D6E]" : "text-[#777184]"}`}
          >
            <TabIcon className="mb-1 size-5" strokeWidth={active === id ? 2.8 : 2} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function JobCard({
  job,
  worker,
  onOpen,
  onAccepted,
  onRejected,
  t,
}: {
  job: Job;
  worker: Worker;
  onOpen: () => void;
  onAccepted: () => void;
  onRejected: () => void;
  t: typeof copy.en;
}) {
  const match = scoreWorker(job, worker);
  const SkillIcon = getSkillIcon(job.skills[0]);
  return (
    <article className="rounded-[1.4rem] bg-white p-4 shadow-[0_5px_18px_rgba(53,43,25,.07)] ring-1 ring-[#E9E2D8]">
      <div className="flex items-start gap-3">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#FFF0C9] text-[#865500]">
          <SkillIcon className="size-7" strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#8A5700]">
            {labelSkill(job.skills[0])}
          </p>
          <h3 className="mt-0.5 text-lg font-black leading-tight text-[#2E2A3D]">{job.title}</h3>
          <p className="mt-2 text-3xl font-black text-[#16855B]">
            ₹{job.wage}
            <span className="text-sm font-bold text-[#6D6875]"> / day</span>
          </p>
        </div>
        <ScoreRing score={match.total} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#F8F5F0] p-3 text-sm font-bold text-[#5B5663]">
        <span className="flex items-center gap-2">
          <MapPin className="size-4 text-[#D57E00]" />
          {match.breakdown.distanceKm.toFixed(1)} km
        </span>
        <span className="flex items-center gap-2">
          <CalendarDays className="size-4 text-[#D57E00]" />
          {prettyDate(job.date)}
        </span>
        <span className="col-span-2 flex items-center gap-2">
          <Clock3 className="size-4 text-[#D57E00]" />
          {job.duration}
        </span>
      </div>
      <div className="mt-3 flex items-center text-sm font-bold text-[#4E4A57]">
        <span className="truncate">{job.employerName}</span>
        {job.employerVerified && <BadgeCheck className="ml-1 size-5 fill-[#16855B] text-white" />}
        <Star className="ml-auto size-4 fill-[#F59E0B] text-[#F59E0B]" />
        <span className="ml-1">{job.employerRating}</span>
      </div>
      <button
        onClick={onOpen}
        className="mt-2 min-h-12 w-full text-sm font-extrabold text-[#2B2D6E] underline decoration-2 underline-offset-4"
      >
        {t.details}
      </button>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <Button
          variant="danger"
          onClick={onRejected}
          className="flex items-center justify-center gap-2 px-2"
        >
          <X className="size-5" />
          {t.reject}
        </Button>
        <Button
          variant="success"
          onClick={onAccepted}
          className="flex items-center justify-center gap-2 px-2"
        >
          <Check className="size-5" />
          {t.accept}
        </Button>
      </div>
    </article>
  );
}

function WorkerApp({
  language,
  setLanguage,
  profile,
  onExit,
}: {
  language: Language;
  setLanguage: (l: Language) => void;
  profile: ProfileDraft;
  onExit: () => void;
}) {
  const t = copy[language];
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Job | null>(null);
  const [filters, setFilters] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const worker: Worker = {
    ...seedWorkers[0],
    skills: profile.skills,
    area: AREAS[profile.areaName],
    maxTravelKm: profile.maxTravelKm,
    expectedWage: profile.expectedWage,
    availableDates: profile.availableDates,
  };
  useEffect(() => {
    getJobs()
      .then(setJobs)
      .finally(() => setLoading(false));
  }, []);
  let ranked = rankJobsForWorker(worker, jobs).filter(({ job }) => job.status === "Open");
  if (filters.includes("Today")) ranked = ranked.filter(({ job }) => job.date === today);
  if (filters.includes("Within 5 km"))
    ranked = ranked.filter(({ score }) => score.breakdown.distanceKm <= 5);
  if (filters.includes("Highest pay")) ranked = [...ranked].sort((a, b) => b.job.wage - a.job.wage);
  const accepted = jobs.filter((job) => job.status === "Worker accepted");
  const toggleFilter = (filter: string) =>
    setFilters(
      filters.includes(filter) ? filters.filter((item) => item !== filter) : [...filters, filter],
    );
  const handleAccept = async (job: Job) => {
    await acceptJob(job.id);
    setJobs(
      jobs.map((item) => (item.id === job.id ? { ...item, status: "Worker accepted" } : item)),
    );
    setDetail(null);
    setMessage("Job accepted! Employer will contact you.");
    setTimeout(() => setMessage(""), 3000);
  };
  const handleReject = async (job: Job) => {
    await rejectJob(job.id);
    setJobs(jobs.filter((item) => item.id !== job.id));
    setMessage("Job removed");
    setTimeout(() => setMessage(""), 2000);
  };
  if (detail)
    return (
      <JobDetail
        job={detail}
        worker={worker}
        language={language}
        setLanguage={setLanguage}
        onBack={() => setDetail(null)}
        onAccept={() => handleAccept(detail)}
      />
    );
  return (
    <div className="min-h-screen bg-[#FFFBF5] pb-24">
      <AppHeader language={language} setLanguage={setLanguage} />
      {message && (
        <div
          role="status"
          className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-2xl bg-[#163E31] px-5 py-3 text-center font-bold text-white shadow-xl"
        >
          {message}
        </div>
      )}
      <main className="mx-auto max-w-xl px-4 py-6">
        {tab === "jobs" && (
          <>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#292643]">{t.nearYou}</h2>
                <p className="mt-1 font-semibold text-[#756F7B]">{t.bestFirst}</p>
              </div>
              <VoiceButton />
            </div>
            <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
              {[
                ["Today", t.today],
                ["Within 5 km", t.within],
                ["Highest pay", t.highest],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => toggleFilter(id)}
                  className={`min-h-12 shrink-0 rounded-full border-2 px-4 text-sm font-extrabold ${filters.includes(id) ? "border-[#2B2D6E] bg-[#2B2D6E] text-white" : "border-[#DFD9D1] bg-white text-[#55505C]"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-72 animate-pulse rounded-2xl bg-[#EDE9E3]" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {ranked.map(({ job }) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    worker={worker}
                    onOpen={() => setDetail(job)}
                    onAccepted={() => handleAccept(job)}
                    onRejected={() => handleReject(job)}
                    t={t}
                  />
                ))}
                {!ranked.length && <EmptyState text={t.noWork} />}
              </div>
            )}
          </>
        )}
        {tab === "profile" && <WorkerProfile worker={worker} t={t} onExit={onExit} />}
        {tab === "work" && <MyWork jobs={accepted} t={t} />}
      </main>
      <WorkerBottomNav active={tab} setActive={setTab} t={t} />
    </div>
  );
}

function JobDetail({
  job,
  worker,
  language,
  setLanguage,
  onBack,
  onAccept,
}: {
  job: Job;
  worker: Worker;
  language: Language;
  setLanguage: (l: Language) => void;
  onBack: () => void;
  onAccept: () => void;
}) {
  const t = copy[language];
  const match = scoreWorker(job, worker);
  return (
    <div className="min-h-screen bg-[#FFFBF5] pb-28">
      <AppHeader
        language={language}
        setLanguage={setLanguage}
        onBack={onBack}
        title="Job details"
      />
      <main className="mx-auto max-w-xl">
        <div className="map-pattern relative h-52 overflow-hidden bg-[#EAE7DB]">
          <div className="absolute left-[22%] top-[28%] h-3 w-32 rotate-12 rounded-full bg-white" />
          <div className="absolute right-[8%] top-[50%] h-3 w-40 -rotate-45 rounded-full bg-white" />
          <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#2B2D6E] text-white shadow-xl">
            <MapPin className="size-8" />
          </span>
          <div className="absolute bottom-3 left-3 rounded-xl bg-white px-3 py-2 text-sm font-bold shadow">
            {job.area.name} • {match.breakdown.distanceKm.toFixed(1)} km
          </div>
        </div>
        <div className="px-4 py-5">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-bold text-[#8A5700]">{job.skills.map(labelSkill).join(" + ")}</p>
              <h1 className="mt-1 text-2xl font-black">{job.title}</h1>
              <p className="mt-2 text-4xl font-black text-[#16855B]">
                ₹{job.wage}
                <span className="text-sm text-[#6D6875]"> / day</span>
              </p>
            </div>
            <ScoreRing score={match.total} />
          </div>
          <div className="my-5 rounded-2xl bg-white p-4 ring-1 ring-[#E6DFD6]">
            <p className="font-semibold leading-relaxed text-[#58535F]">{job.description}</p>
            <div className="mt-4 grid gap-3 font-bold">
              <span className="flex gap-2">
                <CalendarDays className="text-[#D57E00]" />
                {prettyDate(job.date)}
              </span>
              <span className="flex gap-2">
                <Clock3 className="text-[#D57E00]" />
                {job.duration}
              </span>
              <span className="flex gap-2">
                <UsersRound className="text-[#D57E00]" />
                {job.workersNeeded} worker needed
              </span>
            </div>
          </div>
          <section className="rounded-2xl bg-[#EEF8F3] p-5">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="flex-1 text-lg font-black text-[#12583F]">{t.suits}</h2>
              <VoiceButton />
            </div>
            <ul className="space-y-3">
              {match.reasons.slice(0, 4).map((reason) => (
                <li key={reason} className="flex items-center gap-3 font-bold text-[#274E41]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#16855B] text-white">
                    <Check className="size-4" />
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </section>
          <div className="mt-5 flex items-center rounded-2xl bg-white p-4 ring-1 ring-[#E6DFD6]">
            <div>
              <p className="text-xs font-bold uppercase text-[#7B7580]">{t.employerLabel}</p>
              <p className="font-black">{job.employerName}</p>
            </div>
            {job.employerVerified && <BadgeCheck className="ml-2 fill-[#16855B] text-white" />}
            <span className="ml-auto flex font-bold">
              <Star className="mr-1 fill-[#F59E0B] text-[#F59E0B]" />
              {job.employerRating}
            </span>
          </div>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t bg-[#FFFBF5]/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-3">
          <Button
            variant="success"
            onClick={onAccept}
            className="flex flex-1 items-center justify-center gap-2"
          >
            <Check />
            {t.accept} job
          </Button>
          <VoiceButton />
        </div>
      </div>
    </div>
  );
}

function WorkerProfile({
  worker,
  t,
  onExit,
}: {
  worker: Worker;
  t: typeof copy.en;
  onExit: () => void;
}) {
  return (
    <div>
      <div className="rounded-2xl bg-[#2B2D6E] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="grid size-20 place-items-center rounded-2xl bg-[#F59E0B] text-2xl font-black text-[#2B2D6E]">
            {worker.avatar}
          </div>
          <div>
            <h2 className="text-2xl font-black">{worker.name}</h2>
            <p className="mt-1 flex items-center gap-1 font-semibold text-white/75">
              <MapPin className="size-4" />
              {worker.area.name}
            </p>
            <p className="mt-1 flex items-center gap-1 font-bold text-[#FFE19B]">
              <BadgeCheck className="size-5" />
              Verified worker
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-[#E6DFD6]">
        <h3 className="font-black">Skills</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {worker.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-[#EEEFFB] px-4 py-2 font-bold text-[#2B2D6E]"
            >
              {labelSkill(skill)}
            </span>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t pt-4">
          <span className="font-bold text-[#6D6875]">{t.expected}</span>
          <strong className="text-xl text-[#16855B]">₹{worker.expectedWage}</strong>
        </div>
      </div>
      <Button variant="secondary" onClick={onExit} className="mt-6 w-full">
        Change role
      </Button>
    </div>
  );
}

function MyWork({ jobs, t }: { jobs: Job[]; t: typeof copy.en }) {
  const [active, setActive] = useState("upcoming");
  return (
    <div>
      <h2 className="text-2xl font-black">{t.myWork}</h2>
      <div className="my-5 grid grid-cols-2 rounded-2xl bg-[#ECE8E2] p-1">
        <button
          onClick={() => setActive("upcoming")}
          className={`min-h-12 rounded-xl font-bold ${active === "upcoming" ? "bg-white text-[#2B2D6E] shadow-sm" : "text-[#6B6572]"}`}
        >
          {t.upcoming}
        </button>
        <button
          onClick={() => setActive("completed")}
          className={`min-h-12 rounded-xl font-bold ${active === "completed" ? "bg-white text-[#2B2D6E] shadow-sm" : "text-[#6B6572]"}`}
        >
          {t.completed}
        </button>
      </div>
      {active === "upcoming" ? (
        jobs.length ? (
          jobs.map((job) => (
            <div key={job.id} className="mb-3 rounded-2xl bg-white p-4 ring-1 ring-[#E6DFD6]">
              <p className="text-xl font-black">{job.title}</p>
              <p className="mt-2 flex items-center gap-2 font-bold text-[#6B6572]">
                <CalendarDays className="size-5 text-[#D57E00]" />
                {prettyDate(job.date)}
              </p>
              <p className="mt-2 text-2xl font-black text-[#16855B]">₹{job.wage}</p>
            </div>
          ))
        ) : (
          <EmptyState text={t.noWork} />
        )
      ) : (
        <div className="rounded-2xl bg-white p-5 text-center ring-1 ring-[#E6DFD6]">
          <p className="font-black">Rate employer</p>
          <div className="my-4 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                aria-label={`${star} stars`}
                className="grid size-12 place-items-center"
              >
                <Star className="size-8 fill-[#F59E0B] text-[#F59E0B]" />
              </button>
            ))}
          </div>
          <Button variant="danger" className="w-full">
            {t.report}
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#DCD5CC] p-10 text-center">
      <BriefcaseBusiness className="mx-auto size-12 text-[#A29AA6]" />
      <p className="mt-3 font-bold text-[#777184]">{text}</p>
    </div>
  );
}

type PostDraft = {
  skills: Skill[];
  areaName: string;
  date: string;
  duration: string;
  wage: number;
  workersNeeded: number;
};

function EmployerApp({
  language,
  setLanguage,
  onExit,
}: {
  language: Language;
  setLanguage: (l: Language) => void;
  onExit: () => void;
}) {
  const [tab, setTab] = useState("post");
  const [draft, setDraft] = useState<PostDraft>({
    skills: [],
    areaName: "Hebbal",
    date: futureDate(1),
    duration: "Full day",
    wage: 800,
    workersNeeded: 1,
  });
  const [postedJob, setPostedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>(seedJobs.filter((job) => job.employerId === "e1"));
  const submit = async () => {
    const employer = employers[0];
    const job = await postJob({
      title: `${labelSkill(draft.skills[0])} needed`,
      skills: draft.skills,
      area: AREAS[draft.areaName],
      date: draft.date,
      duration: draft.duration,
      wage: draft.wage,
      workersNeeded: draft.workersNeeded,
      employerId: employer.id,
      employerName: employer.name,
      employerRating: employer.rating,
      employerVerified: true,
      description: `${draft.duration} work in ${draft.areaName}.`,
      status: "Open",
    });
    setJobs([job, ...jobs]);
    setPostedJob(job);
    setTab("workers");
  };
  const tabs = [
    { id: "post", label: "Post Job", icon: Plus },
    { id: "jobs", label: "My Jobs", icon: BriefcaseBusiness },
    { id: "workers", label: "Workers", icon: UsersRound },
  ];
  return (
    <div className="min-h-screen bg-[#FFFBF5] pb-24">
      <AppHeader language={language} setLanguage={setLanguage} title="Employer" />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {tab === "post" && <PostJob draft={draft} setDraft={setDraft} onSubmit={submit} />}
        {tab === "workers" && postedJob ? (
          <RankedWorkers job={postedJob} />
        ) : tab === "workers" ? (
          <EmptyState text="Post a job to see matching workers" />
        ) : null}
        {tab === "jobs" && <EmployerJobs jobs={jobs} onExit={onExit} />}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-white p-2">
        <div className="mx-auto flex max-w-2xl justify-around">
          {tabs.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex min-h-16 min-w-24 flex-col items-center justify-center rounded-xl text-xs font-extrabold ${tab === id ? "bg-[#EEEFFB] text-[#2B2D6E]" : "text-[#777184]"}`}
            >
              <TabIcon className="mb-1 size-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function PostJob({
  draft,
  setDraft,
  onSubmit,
}: {
  draft: PostDraft;
  setDraft: (draft: PostDraft) => void;
  onSubmit: () => void;
}) {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="font-bold text-[#8A5700]">Quick job post</p>
          <h1 className="text-3xl font-black text-[#292643]">What help do you need?</h1>
        </div>
        <VoiceButton />
      </div>
      <section>
        <h2 className="mb-3 text-lg font-black">1. Pick work type</h2>
        <SkillGrid
          selected={draft.skills}
          onToggle={(skill) =>
            setDraft({
              ...draft,
              skills: draft.skills.includes(skill)
                ? draft.skills.filter((item) => item !== skill)
                : [skill],
            })
          }
        />
      </section>
      <section className="mt-7 space-y-4">
        <h2 className="text-lg font-black">2. Place & day</h2>
        <label className="block font-bold">
          Area
          <select
            value={draft.areaName}
            onChange={(event) => setDraft({ ...draft, areaName: event.target.value })}
            className="mt-2 min-h-14 w-full rounded-2xl border-2 border-[#DED7CF] bg-white px-4 outline-none focus:border-[#2B2D6E]"
          >
            {Object.keys(AREAS).map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </label>
        <label className="block font-bold">
          Date
          <input
            value={draft.date}
            min={today}
            onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            type="date"
            className="mt-2 min-h-14 w-full rounded-2xl border-2 border-[#DED7CF] bg-white px-4 outline-none focus:border-[#2B2D6E]"
          />
        </label>
        <div>
          <p className="mb-2 font-bold">Duration</p>
          <div className="grid grid-cols-2 gap-2">
            {["Half day", "Full day", "2–3 days", "1 week"].map((duration) => (
              <button
                key={duration}
                onClick={() => setDraft({ ...draft, duration })}
                className={`min-h-14 rounded-2xl border-2 font-bold ${draft.duration === duration ? "border-[#2B2D6E] bg-[#EEEFFB] text-[#2B2D6E]" : "border-[#DED7CF] bg-white"}`}
              >
                {duration}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="mt-7 grid gap-4 sm:grid-cols-2">
        <Stepper
          label="Wage per day"
          value={`₹${draft.wage}`}
          onMinus={() => setDraft({ ...draft, wage: Math.max(300, draft.wage - 50) })}
          onPlus={() => setDraft({ ...draft, wage: Math.min(2000, draft.wage + 50) })}
        />
        <Stepper
          label="Workers needed"
          value={String(draft.workersNeeded)}
          onMinus={() =>
            setDraft({ ...draft, workersNeeded: Math.max(1, draft.workersNeeded - 1) })
          }
          onPlus={() =>
            setDraft({ ...draft, workersNeeded: Math.min(10, draft.workersNeeded + 1) })
          }
        />
      </section>
      <Button
        disabled={!draft.skills.length}
        onClick={onSubmit}
        className="mt-7 flex w-full items-center justify-center gap-2 text-lg"
      >
        <UsersRound />
        Find workers
      </Button>
    </div>
  );
}

function Stepper({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-[#E6DFD6]">
      <p className="text-center font-bold">{label}</p>
      <div className="mt-3 flex items-center justify-between">
        <button
          aria-label={`Reduce ${label}`}
          onClick={onMinus}
          className="grid size-14 place-items-center rounded-xl bg-[#EEEFF7] text-[#2B2D6E]"
        >
          <Minus />
        </button>
        <strong className="text-2xl text-[#16855B]">{value}</strong>
        <button
          aria-label={`Increase ${label}`}
          onClick={onPlus}
          className="grid size-14 place-items-center rounded-xl bg-[#2B2D6E] text-white"
        >
          <Plus />
        </button>
      </div>
    </div>
  );
}

const breakdownItems: {
  key: keyof Omit<MatchBreakdown, "distanceKm">;
  label: string;
  weight: number;
}[] = [
  { key: "skill", label: "Skill match", weight: 35 },
  { key: "distance", label: "Distance", weight: 25 },
  { key: "wage", label: "Wage fit", weight: 15 },
  { key: "availability", label: "Availability", weight: 15 },
  { key: "rating", label: "Rating", weight: 10 },
];

function RankedWorkers({ job }: { job: Job }) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [shortlist, setShortlist] = useState<Worker[]>([]);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    getWorkers()
      .then(setWorkers)
      .finally(() => setLoading(false));
  }, []);
  const ranked = rankWorkers(job, workers);
  return (
    <div>
      <div className="mb-5">
        <p className="font-bold text-[#8A5700]">Best matches</p>
        <h1 className="text-3xl font-black">Workers for your job</h1>
        <p className="mt-2 font-semibold text-[#716B78]">
          {job.title} • {job.area.name} •{" "}
          <strong className="text-[#16855B]">₹{job.wage}/day</strong>
        </p>
      </div>
      {shortlist.length > 0 && (
        <div className="sticky top-[73px] z-20 mb-4 rounded-2xl bg-[#2B2D6E] p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {shortlist.map((worker) => (
                <span
                  key={worker.id}
                  className="grid size-10 place-items-center rounded-full border-2 border-[#2B2D6E] bg-[#F59E0B] text-xs font-black text-[#2B2D6E]"
                >
                  {worker.avatar}
                </span>
              ))}
            </div>
            <div>
              <p className="font-black">Shortlist · {shortlist.length}</p>
              <p className="text-xs text-white/70">Phone hidden until accepted</p>
            </div>
            <Button
              onClick={() => setSent(true)}
              className="ml-auto min-h-12 bg-[#F59E0B] px-3 text-sm text-[#332000] shadow-none"
            >
              {sent ? "Request sent" : "Send request"}
            </Button>
          </div>
        </div>
      )}
      {loading ? (
        <div className="h-80 animate-pulse rounded-2xl bg-[#EDE9E3]" />
      ) : (
        <div className="space-y-4">
          {ranked.slice(0, 8).map(({ worker, score }) => {
            const open = expanded.includes(worker.id);
            const chosen = shortlist.some((item) => item.id === worker.id);
            return (
              <article
                key={worker.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E6DFD6]"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#E9EAF6] font-black text-[#2B2D6E]">
                      {worker.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <h2 className="truncate text-lg font-black">{worker.name}</h2>
                        {worker.verified && (
                          <BadgeCheck className="ml-1 size-5 fill-[#16855B] text-white" />
                        )}
                      </div>
                      <p className="mt-1 text-sm font-bold text-[#6B6572]">
                        {worker.skills.map(labelSkill).slice(0, 2).join(" • ")}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm font-bold">
                        <span>
                          <MapPin className="mr-1 inline size-4 text-[#D57E00]" />
                          {score.breakdown.distanceKm.toFixed(1)} km
                        </span>
                        <span className="text-[#16855B]">₹{worker.expectedWage}</span>
                        <span>
                          <Star className="mr-1 inline size-4 fill-[#F59E0B] text-[#F59E0B]" />
                          {worker.rating}
                        </span>
                      </div>
                    </div>
                    <ScoreRing score={score.total} />
                  </div>
                  <button
                    onClick={() =>
                      setExpanded(
                        open ? expanded.filter((id) => id !== worker.id) : [...expanded, worker.id],
                      )
                    }
                    className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F2F0EC] font-extrabold text-[#2B2D6E]"
                  >
                    <CircleHelp className="size-5" />
                    Why this match?
                    <ChevronDown className={`size-5 transition ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && (
                    <div className="mt-4 border-t pt-4">
                      {breakdownItems.map(({ key, label, weight }) => {
                        const earned = Math.round(score.breakdown[key] * weight);
                        return (
                          <div key={key} className="mb-3">
                            <div className="mb-1 flex justify-between text-xs font-bold">
                              <span>
                                {label} ({weight}%)
                              </span>
                              <span>
                                {earned}/{weight}
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[#E7E3DD]">
                              <div
                                className="h-full rounded-full bg-[#2B2D6E]"
                                style={{ width: `${score.breakdown[key] * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <p className="rounded-xl bg-[#FFF6DD] p-3 text-sm font-semibold leading-relaxed">
                        <strong>Matched because:</strong> {score.reasons.join(", ").toLowerCase()}.
                      </p>
                    </div>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button variant="secondary">Skip</Button>
                    <Button
                      variant={chosen ? "success" : "primary"}
                      onClick={() =>
                        setShortlist(
                          chosen
                            ? shortlist.filter((item) => item.id !== worker.id)
                            : [...shortlist, worker],
                        )
                      }
                    >
                      {chosen ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmployerJobs({ jobs, onExit }: { jobs: Job[]; onExit: () => void }) {
  return (
    <div>
      <h1 className="mb-5 text-3xl font-black">My posted jobs</h1>
      <div className="space-y-3">
        {jobs.map((job) => (
          <article key={job.id} className="rounded-2xl bg-white p-4 ring-1 ring-[#E6DFD6]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">{job.title}</h2>
                <p className="mt-1 font-bold text-[#6D6875]">
                  {job.area.name} • {prettyDate(job.date)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${job.status === "Open" ? "bg-[#FFF0C9] text-[#754A00]" : "bg-[#E9F8F1] text-[#116B49]"}`}
              >
                {job.status}
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-[#16855B]">₹{job.wage}</p>
          </article>
        ))}
      </div>
      <Button variant="secondary" onClick={onExit} className="mt-6 w-full">
        Change role
      </Button>
    </div>
  );
}

function AdminDashboard({
  language,
  setLanguage,
  onExit,
}: {
  language: Language;
  setLanguage: (l: Language) => void;
  onExit: () => void;
}) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [queue, setQueue] = useState(seedWorkers.filter((worker) => !worker.verified).slice(0, 4));
  const [complaints, setComplaints] = useState(seedComplaints);
  useEffect(() => {
    getAdminStats().then(setStats);
  }, []);
  const metrics = [
    ["Registered workers", stats?.workers ?? "—", UsersRound],
    ["Employers", stats?.employers ?? "—", BriefcaseBusiness],
    ["Jobs posted", stats?.jobsPosted ?? "—", CalendarDays],
    ["Jobs filled", stats?.jobsFilled ?? "—", Check],
    ["Avg. time to match", stats ? `${stats.avgMatchMinutes} min` : "—", Clock3],
  ] as const;
  const chartData = [
    { method: "Weighted", accuracy: 91, distance: 82 },
    { method: "Distance-only", accuracy: 63, distance: 94 },
    { method: "Skill-only", accuracy: 76, distance: 58 },
  ];
  return (
    <div className="min-h-screen bg-[#F7F4EF]">
      <AppHeader language={language} setLanguage={setLanguage} title="Safety dashboard" />
      <main className="mx-auto max-w-7xl px-4 py-7 md:px-8">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="font-bold text-[#8A5700]">ShramSaathi Admin</p>
            <h1 className="text-3xl font-black text-[#292643]">Community overview</h1>
          </div>
          <Button variant="secondary" onClick={onExit} className="hidden md:block">
            Exit admin
          </Button>
        </div>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map(([label, value, MetricIcon]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E6DFD6]">
              <span className="grid size-11 place-items-center rounded-xl bg-[#EEEFFB] text-[#2B2D6E]">
                <MetricIcon />
              </span>
              <p className="mt-4 text-3xl font-black text-[#292643]">{value}</p>
              <p className="mt-1 text-sm font-bold text-[#777184]">{label}</p>
            </div>
          ))}
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E6DFD6]">
            <div className="border-b p-5">
              <h2 className="text-xl font-black">Verification queue</h2>
              <p className="text-sm font-semibold text-[#777184]">
                Review identity details before approval
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead className="bg-[#F7F4EF] text-xs uppercase text-[#777184]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Area</th>
                    <th className="p-4">ID type</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((worker, index) => (
                    <tr key={worker.id} className="border-t">
                      <td className="p-4 font-black">{worker.name}</td>
                      <td className="p-4 font-semibold">{worker.area.name}</td>
                      <td className="p-4 font-semibold">
                        {index % 2 ? "Voter ID • 3812" : "Aadhaar • 6729"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setQueue(queue.filter((item) => item.id !== worker.id))}
                            className="min-h-10 rounded-xl bg-[#16855B] px-3 font-bold text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setQueue(queue.filter((item) => item.id !== worker.id))}
                            className="min-h-10 rounded-xl bg-[#FFF1EF] px-3 font-bold text-[#B42318]"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!queue.length && (
                <p className="p-8 text-center font-bold text-[#777184]">All caught up</p>
              )}
            </div>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E6DFD6]">
            <h2 className="text-xl font-black">Open complaints</h2>
            <div className="mt-4 space-y-3">
              {complaints
                .filter((item) => item.status === "Open")
                .map((complaint) => (
                  <div key={complaint.id} className="rounded-xl bg-[#FFF8E9] p-4">
                    <div className="flex justify-between">
                      <strong>{complaint.reporterName}</strong>
                      <span className="text-xs font-black text-[#A15D00]">OPEN</span>
                    </div>
                    <p className="my-2 text-sm font-semibold text-[#625D67]">{complaint.reason}</p>
                    <button
                      onClick={() =>
                        setComplaints(
                          complaints.map((item) =>
                            item.id === complaint.id ? { ...item, status: "Resolved" } : item,
                          ),
                        )
                      }
                      className="min-h-10 font-black text-[#2B2D6E]"
                    >
                      Mark resolved
                    </button>
                  </div>
                ))}
              {!complaints.some((item) => item.status === "Open") && (
                <p className="py-8 text-center font-bold text-[#777184]">No open complaints</p>
              )}
            </div>
          </section>
        </div>
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E6DFD6]">
          <h2 className="text-xl font-black">Matching quality comparison</h2>
          <p className="mb-5 text-sm font-semibold text-[#777184]">
            Higher score is better • Sample evaluation index
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="method" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="accuracy"
                  name="Match accuracy"
                  fill="#2B2D6E"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="distance"
                  name="Distance score"
                  fill="#F59E0B"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <Button variant="secondary" onClick={onExit} className="mt-6 w-full md:hidden">
          Exit admin
        </Button>
      </main>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<Role>("landing");
  const [language, setLanguage] = useState<Language>("en");
  const [profile, setProfile] = useState<ProfileDraft | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("shram-profile") ?? "null");
    } catch {
      return null;
    }
  });
  const [showSetup, setShowSetup] = useState(false);
  const chooseRole = (next: Role) => {
    setRole(next);
    if (next === "worker" && !profile) setShowSetup(true);
  };
  const exit = () => {
    setRole("landing");
    setShowSetup(false);
  };
  if (role === "landing")
    return <Landing language={language} setLanguage={setLanguage} onRole={chooseRole} />;
  if (role === "worker" && (showSetup || !profile))
    return (
      <WorkerSetup
        language={language}
        setLanguage={setLanguage}
        onExit={exit}
        onDone={(draft) => {
          localStorage.setItem("shram-profile", JSON.stringify(draft));
          setProfile(draft);
          setShowSetup(false);
        }}
      />
    );
  if (role === "worker" && profile)
    return (
      <WorkerApp language={language} setLanguage={setLanguage} profile={profile} onExit={exit} />
    );
  if (role === "employer")
    return <EmployerApp language={language} setLanguage={setLanguage} onExit={exit} />;
  return <AdminDashboard language={language} setLanguage={setLanguage} onExit={exit} />;
}
