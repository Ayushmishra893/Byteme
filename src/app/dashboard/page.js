"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const CIRCUMFERENCE = 213.6;

const CATEGORY_LABELS = {
  technical: "Technical",
  hr: "HR",
  project: "Project",
  coding: "Coding",
};

/* ─────────────────────────────────────────────
   Small helpers
───────────────────────────────────────────── */
function initials(name) {
  if (!name) return "U";
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

function getHostname(url) {
  try {
    return new URL(
      url.startsWith("http") ? url : `https://${url}`,
    ).hostname.replace("www.", "");
  } catch {
    return "Unknown";
  }
}

// Best-effort guess at the role title — just grabs the first short,
// non-empty line of the pasted posting (most postings lead with the title).
function detectRoleTitle(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const firstLine = lines[0] || "";
  if (firstLine.length > 0 && firstLine.length <= 80) return firstLine;
  return "Role title not detected — see full posting below";
}

// Lightweight keyword sniff for seniority — no model call needed for this.
function detectSeniority(text) {
  const lower = text.toLowerCase();
  if (/\bintern(ship)?\b/.test(lower)) return "Entry-level / Internship";
  if (/\b(senior|sr\.|staff|principal|lead)\b/.test(lower)) return "Senior";
  if (/\b(junior|entry[- ]level|new grad|graduate)\b/.test(lower))
    return "Entry-level";
  if (/\b(mid[- ]level|intermediate)\b/.test(lower)) return "Mid-level";
  return "Not specified in posting";
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="field-error text-xs text-coral font-medium mt-1.5">
      {message}
    </p>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#14233D"
        strokeWidth="2.5"
        strokeOpacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="#14233D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Shared logo + icons
───────────────────────────────────────────── */
function LogoMark({ size = 8 }) {
  const px = size === 7 ? 15 : 18;
  return (
    <span
      className={`w-${size} h-${size} rounded-[10px] bg-lime flex items-center justify-center`}
    >
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke="#14233D" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="1.6" fill="#14233D" />
        <path
          d="M12 3.5V6"
          stroke="#14233D"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M16.2 8.6L12 12L8.6 14.6"
          stroke="#14233D"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

const NAV_ICONS = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11.5 12 4l8 7.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 9.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1V9.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  interview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 4h11a1 1 0 0 1 1 1v13l-4-3H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M4 8v10l3-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  jd: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v5h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle
        cx="10.5"
        cy="14"
        r="2.1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12.1 15.6 14 17.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  about: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 11v5.5M12 8v.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <circle
        cx="12"
        cy="9.8"
        r="2.6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M6.5 18.2c1.1-2.3 3.2-3.6 5.5-3.6s4.4 1.3 5.5 3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: "home", label: "Homepage" },
  { id: "interview", label: "Interview" },
  { id: "jd", label: "AI Job Description" },
  { id: "about", label: "About Us" },
];

/* ─────────────────────────────────────────────
   Sidebar nav button
───────────────────────────────────────────── */
function NavBtn({ id, label, active, onClick, className = "" }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`sidebar-link w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left${active ? " active" : ""}${className}`}
    >
      {NAV_ICONS[id]}
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Skill chip
───────────────────────────────────────────── */
function SkillChip({ text, kind }) {
  if (kind === "match") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-forest/10 text-forest text-xs font-semibold px-3 py-1.5 rounded-full">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {text}
      </span>
    );
  }
  if (kind === "missing") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-coral/10 text-coral text-xs font-semibold px-3 py-1.5 rounded-full">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9v4M12 17h.01"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
        {text}
      </span>
    );
  }
  if (kind === "must") {
    return (
      <span className="inline-flex items-center bg-navy text-white text-xs font-semibold px-3 py-1.5 rounded-full">
        {text}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center bg-panel text-forest text-xs font-semibold px-3 py-1.5 rounded-full border border-forest/20">
      {text}
    </span>
  );
}

/* ═════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();

  /* ── Auth ── */
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else router.push("/login");
      setCheckingAuth(false);
    });
    return () => unsub();
  }, [router]);

  /* ── Nav ── */
  const [activeSection, setActiveSection] = useState("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigate = (section) => {
    setActiveSection(section);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── HOME: resume + job input ── */
  const [resumeFile, setResumeFile] = useState(null);
  const [dropzoneError, setDropzoneError] = useState(false);
  const [dropzoneActive, setDropzoneActive] = useState(false);
  const [usingTextInput, setUsingTextInput] = useState(false);
  const [jobLink, setJobLink] = useState("");
  const [jobText, setJobText] = useState("");
  const [jobLinkError, setJobLinkError] = useState("");
  const [jobTextError, setJobTextError] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null); // { score, matchedSkills, missingSkills, suggestions, jobLabel }
  const [matchError, setMatchError] = useState("");
  const fileInputRef = useRef(null);

  const applyFile = (file) => {
    if (!file) return;
    setResumeFile(file);
    setDropzoneError(false);
  };

  const removeFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCheckMatch = async () => {
    let valid = true;
    if (!resumeFile) {
      setDropzoneError(true);
      valid = false;
    } else setDropzoneError(false);
    if (!usingTextInput && !jobLink.trim()) {
      setJobLinkError("Paste a job posting link, or switch to pasting text.");
      valid = false;
    } else if (!usingTextInput) setJobLinkError("");
    if (usingTextInput && !jobText.trim()) {
      setJobTextError("Paste the job description text.");
      valid = false;
    } else if (usingTextInput) setJobTextError("");
    if (!valid) return;

    setMatchLoading(true);
    setMatchResult(null);
    setMatchError("");

    try {
  const jobDescription = usingTextInput ? jobText : jobLink;
  const company = usingTextInput ? "Unknown" : getHostname(jobLink);
  const jobLabel = usingTextInput
    ? "Pasted description"
    : getHostname(jobLink);

  // Step 1: create application
  const createRes = await fetch("/api/applications/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: user.uid, company, jobDescription }),
  });
  const createData = await createRes.json();
  if (!createData.success)
    throw new Error(createData.error || "Failed to create application");

  // Step 2: AI resume match — send the actual file, not pre-read text
  const formData = new FormData();
  formData.append("uid", user.uid);
  formData.append("appId", createData.appId);
  formData.append("jobDescription", jobDescription);
  formData.append("company", company);
  formData.append("resumeFile", resumeFile);

  const analyzeRes = await fetch("/api/ai/resume-match", {
    method: "POST",
    body: formData, // no Content-Type header — browser sets it automatically for FormData
  });
  const analyzeData = await analyzeRes.json();
  if (!analyzeData.success)
    throw new Error(analyzeData.error || "Something went wrong");

  setMatchResult({ ...analyzeData.analysis, jobLabel });
} catch (err) {
  console.error(err);
  setMatchError(err.message || "Network error");
}
    setMatchLoading(false);
  };

  /* ── INTERVIEW ── */
  const [interviewState, setInterviewState] = useState("intro"); // intro | generating | active | results
  const [interviewResumeText, setInterviewResumeText] = useState("");
  const [interviewJobDesc, setInterviewJobDesc] = useState("");
  const [interviewResumeError, setInterviewResumeError] = useState("");
  const [interviewJobDescError, setInterviewJobDescError] = useState("");
  const [interviewGenerating, setInterviewGenerating] = useState(false);
  const [interviewGenError, setInterviewGenError] = useState("");
  const [questions, setQuestions] = useState([]); // flat array of {id, category, prompt}
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewScore, setInterviewScore] = useState(0);
  const [reviewItems, setReviewItems] = useState([]);

  const generateQuestions = async () => {
    let valid = true;
    if (!interviewResumeText.trim()) {
      setInterviewResumeError("Paste your resume text.");
      valid = false;
    } else setInterviewResumeError("");
    if (!interviewJobDesc.trim()) {
      setInterviewJobDescError("Paste the job description.");
      valid = false;
    } else setInterviewJobDescError("");
    if (!valid) return;

    setInterviewGenerating(true);
    setInterviewGenError("");

    try {
      const res = await fetch("/api/ai/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: interviewResumeText,
          jobDescription: interviewJobDesc,
          company: "",
        }),
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.error || "Failed to generate questions");

      // Flatten categories into a single array
      const flat = [];
      let id = 0;
      Object.entries(data.questions).forEach(([category, qs]) => {
        qs.forEach((prompt) => {
          flat.push({ id: id++, category, prompt });
        });
      });

      setQuestions(flat);
      setAnswers({});
      setCurrentQ(0);
      setInterviewState("active");
    } catch (err) {
      setInterviewGenError(err.message || "Network error");
    }

    setInterviewGenerating(false);
  };

  const retakeInterview = () => {
    setAnswers({});
    setCurrentQ(0);
    setQuestions([]);
    setInterviewState("intro");
  };

  const submitInterview = () => {
    setInterviewLoading(true);
    const answered = questions.filter((q) => answers[q.id]?.trim()).length;
    const review = questions.map((q) => ({
      q,
      answered: Boolean(answers[q.id]?.trim()),
      answer: answers[q.id] || "",
    }));
    setInterviewScore(answered);
    setReviewItems(review);
    setInterviewLoading(false);
    setInterviewState("results");
  };

  const currentQuestion = questions[currentQ];
  const isLastQ = questions.length > 0 && currentQ === questions.length - 1;

  /* ── AI JD PARSER ── */
  const [jdInput, setJdInput] = useState("");
  const [jdError, setJdError] = useState("");
  const [jdLoading, setJdLoading] = useState(false);
  const [jdResult, setJdResult] = useState(null);

  const handleParseJd = async () => {
    if (!jdInput.trim()) {
      setJdError("Paste a job description first.");
      return;
    }
    if (jdInput.trim().length < 40) {
      setJdError("That looks too short to be a full job description.");
      return;
    }
    setJdError("");
    setJdLoading(true);
    setJdResult(null);

    try {
      // Reuses the existing /api/ai/resume-match endpoint (no JD-only endpoint
      // exists, and backend routes are off-limits to modify). We pass a
      // deliberately empty/generic resumeText so the model has nothing to
      // "match" against — which means missingSkills effectively becomes
      // "every skill this posting calls for", and matchedSkills/suggestions
      // come back near-empty (handled below with fallback copy).
      const res = await fetch("/api/ai/resume-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText:
            "No resume provided. This request is for job-description analysis only — treat the candidate's skills as entirely unknown so that every skill mentioned in the job description is reported as missing.",
          jobDescription: jdInput,
          company: "JD Parser",
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to parse description");
      }
      if (!data.analysis) {
        throw new Error(
          "The AI returned an unexpected format. Please try again.",
        );
      }

      setJdResult({
        role: detectRoleTitle(jdInput),
        seniority: detectSeniority(jdInput),
        mustHave: data.analysis.missingSkills?.length
          ? data.analysis.missingSkills
          : [],
        niceToHave: data.analysis.matchedSkills?.length
          ? data.analysis.matchedSkills
          : [],
        responsibilities: data.analysis.suggestions?.length
          ? data.analysis.suggestions
          : [],
      });
    } catch (err) {
      setJdError(err.message || "Network error");
    }

    setJdLoading(false);
  };

  /* ── SETTINGS ── */
  const [sName, setSName] = useState("");
  const [sRole, setSRole] = useState("");
  const [sExpected, setSExpected] = useState("");
  const [sLinkedin, setSLinkedin] = useState("");
  const [sGithub, setSGithub] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Populate settings from Firebase user on load
  useEffect(() => {
    if (user) {
      setSName(user.displayName || "");
    }
  }, [user]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  /* ── Loading / auth guard ── */
  if (checkingAuth)
    return <p className="text-center mt-10 text-muted text-sm">Loading…</p>;
  if (!user) return null;

  const firstName = (user.displayName || "there").split(" ")[0];
  const userInitials = initials(user.displayName || user.email);

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen">
      {/* ── SIDEBAR (desktop) ── */}
      <aside className="hidden lg:flex lg:flex-col w-[248px] shrink-0 bg-white border-r border-hairline h-screen sticky top-0">
        <div className="px-6 h-[72px] flex items-center border-b border-hairline">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={8} />
            <span className="font-display font-extrabold text-lg text-navy tracking-tight">
              CareerGPT
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3.5 py-6 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavBtn
              key={item.id}
              id={item.id}
              label={item.label}
              active={activeSection === item.id}
              onClick={navigate}
            />
          ))}
          <div className="pt-4 mt-4 border-t border-hairline">
            <NavBtn
              id="settings"
              label="Profile"
              active={activeSection === "settings"}
              onClick={navigate}
            />
          </div>
        </nav>

        <div className="p-3.5 border-t border-hairline">
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <span className="w-9 h-9 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
              {userInitials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">
                {user.displayName || user.email}
              </p>
              <p className="text-xs text-muted">Free plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-hairline">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-[8px] bg-lime flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="8.5"
                  stroke="#14233D"
                  strokeWidth="1.8"
                />
                <circle cx="12" cy="12" r="1.8" fill="#14233D" />
              </svg>
            </span>
            <span className="font-display font-extrabold text-base text-navy">
              CareerGPT
            </span>
          </Link>
          <button
            aria-label="Open menu"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-navy/5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line
                x1="3"
                y1="6"
                x2="21"
                y2="6"
                stroke="#14233D"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="12"
                x2="21"
                y2="12"
                stroke="#14233D"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="18"
                x2="21"
                y2="18"
                stroke="#14233D"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile slide-down nav */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 z-40 bg-white border-b border-hairline">
          <nav className="flex flex-col gap-1 p-4">
            {NAV_ITEMS.map((item) => (
              <NavBtn
                key={item.id}
                id={item.id}
                label={item.label}
                active={activeSection === item.id}
                onClick={navigate}
                className="py-3"
              />
            ))}
            <NavBtn
              id="settings"
              label="Profile"
              active={activeSection === "settings"}
              onClick={navigate}
              className="py-3 border-t border-hairline mt-2 pt-4"
            />
          </nav>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0 relative sunset-bg">
        <div className="sunset-blob sunset-blob-1" aria-hidden="true"></div>
        <div className="sunset-blob sunset-blob-2" aria-hidden="true"></div>
        <div className="sunset-blob sunset-blob-3" aria-hidden="true"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10 relative z-10">
          {/* ════════════ HOME SECTION ════════════ */}
          {activeSection === "home" && (
            <section>
              <div className="mb-8">
                <h1 className="font-display font-extrabold text-navy text-2xl md:text-[28px] tracking-tight mb-1.5">
                  Welcome back, {firstName}
                </h1>
                <p className="text-muted text-sm">
                  Upload your resume and paste a job link to see how you stack
                  up.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
                {/* Input card */}
                <div className="bg-white rounded-2xl border border-hairline/60 p-6 md:p-7 card-shadow">
                  <h2 className="font-display font-bold text-navy text-base mb-1">
                    Check your match
                  </h2>
                  <p className="text-muted text-xs mb-6">
                    Step 1: add your resume. Step 2: paste the job link. We'll
                    do the rest.
                  </p>

                  {/* Resume dropzone */}
                  <p className="text-xs font-bold text-navy uppercase tracking-wide mb-2">
                    Your resume
                  </p>
                  {!resumeFile ? (
                    <label
                      className={`dropzone flex flex-col items-center justify-center text-center px-6 py-8 rounded-xl cursor-pointer mb-2${dropzoneActive ? " dropzone-active" : ""}${dropzoneError ? " dropzone-error" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDropzoneActive(true);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setDropzoneActive(true);
                      }}
                      onDragLeave={() => setDropzoneActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDropzoneActive(false);
                        applyFile(e.dataTransfer.files[0]);
                      }}
                    >
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="mb-3"
                      >
                        <path
                          d="M12 16V4M12 4 8 8M12 4l4 4"
                          stroke="#2F6F4E"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                          stroke="#2F6F4E"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-navy mb-1">
                        Drop your resume here, or click to browse
                      </p>
                      <p className="text-xs text-muted">
                        PDF or DOCX, up to 10MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={(e) => applyFile(e.target.files[0])}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-panel border border-hairline rounded-xl px-4 py-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center shrink-0">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
                              stroke="#2F6F4E"
                              strokeWidth="1.6"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14 3v5h5"
                              stroke="#2F6F4E"
                              strokeWidth="1.6"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <p className="text-sm font-semibold text-ink truncate">
                          {resumeFile.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove file"
                        onClick={removeFile}
                        className="text-muted hover:text-coral transition-colors shrink-0 ml-2"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 6l12 12M18 6 6 18"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Job link / text */}
                  <p className="text-xs font-bold text-navy uppercase tracking-wide mb-2 mt-6">
                    Job posting link
                  </p>
                  {!usingTextInput && (
                    <>
                      <input
                        type="url"
                        placeholder="Paste a job posting URL"
                        value={jobLink}
                        onChange={(e) => {
                          setJobLink(e.target.value);
                          setJobLinkError("");
                        }}
                        className={`auth-input w-full px-4 py-3 rounded-xl text-sm mb-1.5${jobLinkError ? " input-error" : ""}`}
                      />
                      <FieldError message={jobLinkError} />
                    </>
                  )}
                  <p className="text-xs text-muted mb-2 mt-1">
                    {usingTextInput ? (
                      <>
                        Switched to text.{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setUsingTextInput(false);
                            setJobTextError("");
                          }}
                          className="font-semibold text-forest hover:text-navy transition-colors"
                        >
                          Use a link instead
                        </button>
                        .
                      </>
                    ) : (
                      <>
                        Don't have a link?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setUsingTextInput(true);
                            setJobLinkError("");
                          }}
                          className="font-semibold text-forest hover:text-navy transition-colors"
                        >
                          Paste the description as text instead
                        </button>
                        .
                      </>
                    )}
                  </p>
                  {usingTextInput && (
                    <>
                      <textarea
                        rows={5}
                        placeholder="Paste the job description text here"
                        value={jobText}
                        onChange={(e) => {
                          setJobText(e.target.value);
                          setJobTextError("");
                        }}
                        className={`auth-input w-full px-4 py-3 rounded-xl text-sm resize-none mb-1.5${jobTextError ? " input-error" : ""}`}
                      />
                      <FieldError message={jobTextError} />
                    </>
                  )}

                  {matchError && (
                    <p className="text-xs text-coral font-medium mb-3">
                      {matchError}
                    </p>
                  )}

                  <button
                    onClick={handleCheckMatch}
                    disabled={matchLoading}
                    className={`btn-primary w-full px-7 py-3.5 rounded-full text-base font-bold flex items-center justify-center gap-2.5 mt-4${matchLoading ? " opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {matchLoading ? <Spinner /> : <span>Check my match</span>}
                  </button>
                </div>

                {/* Results card */}
                <div className="bg-white rounded-2xl border border-hairline/60 p-6 md:p-7 card-shadow overflow-y-auto max-h-[680px]">
                  {!matchResult ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                      <div className="w-14 h-14 rounded-full bg-panel flex items-center justify-center mb-4">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="11"
                            cy="11"
                            r="7"
                            stroke="#6B7280"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M21 21l-4.3-4.3"
                            stroke="#6B7280"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <h3 className="font-display font-bold text-navy text-sm mb-1.5">
                        Your match score will show up here
                      </h3>
                      <p className="text-muted text-xs max-w-xs">
                        Add your resume and a job link on the left, then run a
                        check.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display font-bold text-navy text-base">
                          Match results
                        </h2>
                        <span className="text-[11px] text-muted bg-cream px-2.5 py-1 rounded-full border border-hairline truncate max-w-[180px]">
                          {matchResult.jobLabel}
                        </span>
                      </div>

                      {/* Score ring */}
                      <div className="flex items-center gap-5 mb-7">
                        <div className="relative w-20 h-20 shrink-0">
                          <svg width="80" height="80" viewBox="0 0 80 80">
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              fill="none"
                              stroke="#F1F5EE"
                              strokeWidth="8"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              fill="none"
                              stroke={
                                matchResult.score >= 70
                                  ? "#2F6F4E"
                                  : matchResult.score >= 40
                                    ? "#C8FF4D"
                                    : "#E8725A"
                              }
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={CIRCUMFERENCE}
                              strokeDashoffset={
                                CIRCUMFERENCE -
                                (CIRCUMFERENCE * matchResult.score) / 100
                              }
                              transform="rotate(-90 40 40)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-display font-extrabold text-navy text-lg">
                              {matchResult.score}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="font-display font-bold text-navy text-sm mb-1">
                            {matchResult.score >= 70
                              ? "Strong match"
                              : matchResult.score >= 40
                                ? "Partial match"
                                : "Needs work"}
                          </p>
                          <p className="text-muted text-xs leading-relaxed">
                            Based on skills, experience level, and keyword
                            overlap with the posting.
                          </p>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-navy uppercase tracking-wide mb-2.5">
                        Skills you already match
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(matchResult.matchedSkills || []).map((s, i) => (
                          <SkillChip key={i} text={s} kind="match" />
                        ))}
                      </div>

                      <p className="text-xs font-bold text-navy uppercase tracking-wide mb-2.5">
                        Missing or weak skills
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(matchResult.missingSkills || []).map((s, i) => (
                          <SkillChip key={i} text={s} kind="missing" />
                        ))}
                      </div>

                      {matchResult.suggestions?.length > 0 && (
                        <>
                          <p className="text-xs font-bold text-navy uppercase tracking-wide mb-2.5">
                            Suggestions
                          </p>
                          <ul className="space-y-1.5 mb-6">
                            {matchResult.suggestions.map((s, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-ink leading-relaxed"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 shrink-0"></span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      <div className="bg-panel rounded-xl p-4 flex items-start gap-3">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="mt-0.5 shrink-0"
                        >
                          <path
                            d="M12 2 1 21h22L12 2Z"
                            stroke="#2F6F4E"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 9v5M12 17h.01"
                            stroke="#2F6F4E"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                        <p className="text-xs text-forest leading-relaxed">
                          <span className="font-bold">Tip:</span> add 2–3 of the
                          missing skills to your resume's skills section if you
                          genuinely have them — even a project mention helps
                          your match score.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ════════════ INTERVIEW SECTION ════════════ */}
          {activeSection === "interview" && (
            <section>
              <div className="mb-8">
                <h1 className="font-display font-extrabold text-navy text-2xl md:text-[28px] tracking-tight mb-1.5">
                  Interview practice
                </h1>
                <p className="text-muted text-sm">
                  Paste your resume and job description — we'll generate real
                  questions tailored to the role.
                </p>
              </div>

              {/* Intro: collect inputs */}
              {interviewState === "intro" && (
                <div className="bg-white rounded-2xl border border-hairline/60 p-7 md:p-9 card-shadow max-w-2xl mx-auto">
                  <div className="w-14 h-14 rounded-full bg-lime/25 flex items-center justify-center mb-5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 4h11a1 1 0 0 1 1 1v13l-4-3H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
                        stroke="#14233D"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className="font-display font-bold text-navy text-lg mb-1">
                    Generate your practice paper
                  </h2>
                  <p className="text-muted text-sm leading-relaxed mb-6">
                    13 questions across technical, HR, project, and coding —
                    tailored to your resume and target role.
                  </p>

                  <div className="mb-4">
                    <label
                      htmlFor="interviewResume"
                      className="block text-xs font-bold text-navy uppercase tracking-wide mb-2"
                    >
                      Your resume
                    </label>
                    <textarea
                      id="interviewResume"
                      rows={5}
                      placeholder="Paste your resume text here…"
                      value={interviewResumeText}
                      onChange={(e) => {
                        setInterviewResumeText(e.target.value);
                        setInterviewResumeError("");
                      }}
                      className={`auth-input w-full px-4 py-3 rounded-xl text-sm resize-none${interviewResumeError ? " input-error" : ""}`}
                    />
                    <FieldError message={interviewResumeError} />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="interviewJD"
                      className="block text-xs font-bold text-navy uppercase tracking-wide mb-2"
                    >
                      Job description
                    </label>
                    <textarea
                      id="interviewJD"
                      rows={5}
                      placeholder="Paste the job description here…"
                      value={interviewJobDesc}
                      onChange={(e) => {
                        setInterviewJobDesc(e.target.value);
                        setInterviewJobDescError("");
                      }}
                      className={`auth-input w-full px-4 py-3 rounded-xl text-sm resize-none${interviewJobDescError ? " input-error" : ""}`}
                    />
                    <FieldError message={interviewJobDescError} />
                  </div>

                  {interviewGenError && (
                    <p className="text-xs text-coral font-medium mb-4">
                      {interviewGenError}
                    </p>
                  )}

                  <button
                    onClick={generateQuestions}
                    disabled={interviewGenerating}
                    className={`btn-primary w-full px-7 py-3.5 rounded-full text-base font-bold flex items-center justify-center gap-2.5${interviewGenerating ? " opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {interviewGenerating ? (
                      <>
                        <Spinner />
                        <span>Generating questions…</span>
                      </>
                    ) : (
                      <>
                        <span>Generate practice paper</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 12h14M13 6l6 6-6 6"
                            stroke="#14233D"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Active question */}
              {interviewState === "active" && currentQuestion && (
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs font-bold text-navy uppercase tracking-wide">
                        Question {currentQ + 1} of {questions.length}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        {CATEGORY_LABELS[currentQuestion.category]}
                      </p>
                    </div>
                    <div className="h-1.5 w-32 bg-hairline rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentQ + 1) / questions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-hairline/60 p-6 md:p-7 card-shadow mb-5">
                    <p className="font-display font-bold text-navy text-base mb-5">
                      {currentQuestion.prompt}
                    </p>
                    <textarea
                      rows={4}
                      placeholder="Type your answer…"
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: e.target.value,
                        }))
                      }
                      className="auth-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={currentQ === 0}
                      onClick={() => setCurrentQ((q) => q - 1)}
                      className="btn-outline px-6 py-3.5 rounded-full text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {!isLastQ ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQ((q) => q + 1)}
                        className="btn-primary flex-1 px-7 py-3.5 rounded-full text-base font-bold"
                      >
                        Next question
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={submitInterview}
                        className="btn-primary flex-1 px-7 py-3.5 rounded-full text-base font-bold"
                      >
                        Submit paper
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Results */}
              {interviewState === "results" && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl border border-hairline/60 p-7 md:p-9 card-shadow text-center mb-6">
                    <p className="text-xs font-bold text-forest uppercase tracking-wide mb-3">
                      Questions answered
                    </p>
                    <p className="font-display font-extrabold text-navy text-5xl tracking-tight mb-2">
                      {interviewScore}
                      <span className="text-2xl text-muted">
                        /{questions.length}
                      </span>
                    </p>
                    <p className="text-muted text-sm">
                      {interviewScore === questions.length
                        ? "All answered — great discipline."
                        : interviewScore >= Math.ceil(questions.length * 0.6)
                          ? "Good effort — review your skipped questions."
                          : "Come back to the ones you skipped."}
                    </p>
                  </div>

                  <div className="space-y-3 mb-7 overflow-y-auto max-h-[500px] pr-1">
                    {reviewItems.map(({ q, answered, answer }, i) => (
                      <div
                        key={q.id}
                        className="bg-white rounded-xl border border-hairline/60 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-6 h-6 rounded-full ${answered ? "bg-forest" : "bg-hairline"} text-white flex items-center justify-center shrink-0 mt-0.5`}
                          >
                            {answered ? (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M5 13l4 4L19 7"
                                  stroke="white"
                                  strokeWidth="2.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M6 6l12 12M18 6 6 18"
                                  stroke="#9ca3af"
                                  strokeWidth="2.4"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-bold text-navy uppercase tracking-wide">
                                Q{i + 1}
                              </p>
                              <span className="text-[10px] text-muted bg-panel px-2 py-0.5 rounded-full">
                                {CATEGORY_LABELS[q.category]}
                              </span>
                            </div>
                            <p className="text-sm text-ink leading-relaxed mb-2">
                              {q.prompt}
                            </p>
                            {answer && (
                              <p className="text-xs text-muted italic leading-relaxed border-l-2 border-hairline pl-3">
                                {answer}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={retakeInterview}
                    className="btn-outline w-full px-7 py-3.5 rounded-full text-base font-semibold"
                  >
                    Start over
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ════════════ JD PARSER SECTION ════════════ */}
          {activeSection === "jd" && (
            <section>
              <div className="mb-8">
                <h1 className="font-display font-extrabold text-navy text-2xl md:text-[28px] tracking-tight mb-1.5">
                  AI job description parser
                </h1>
                <p className="text-muted text-sm">
                  Paste any posting and get it broken down into role,
                  must-haves, and nice-to-haves.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
                <div className="bg-white rounded-2xl border border-hairline/60 p-6 md:p-7 card-shadow">
                  <label
                    htmlFor="jdParseInput"
                    className="text-xs font-bold text-navy uppercase tracking-wide mb-2 block"
                  >
                    Job description
                  </label>
                  <textarea
                    id="jdParseInput"
                    rows={14}
                    placeholder="Paste the full job posting text here…"
                    value={jdInput}
                    onChange={(e) => {
                      setJdInput(e.target.value);
                      setJdError("");
                    }}
                    className={`auth-input w-full px-4 py-3 rounded-xl text-sm resize-none mb-2${jdError ? " input-error" : ""}`}
                  />
                  <FieldError message={jdError} />
                  <button
                    onClick={handleParseJd}
                    disabled={jdLoading}
                    className={`btn-primary w-full px-7 py-3.5 rounded-full text-base font-bold flex items-center justify-center gap-2.5 mt-3${jdLoading ? " opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {jdLoading ? <Spinner /> : <span>Parse description</span>}
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-hairline/60 p-6 md:p-7 card-shadow overflow-y-auto max-h-[min(680px,75vh)]">
                  {!jdResult ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                      <div className="w-14 h-14 rounded-full bg-panel flex items-center justify-center mb-4">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
                            stroke="#6B7280"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 3v5h5"
                            stroke="#6B7280"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <h3 className="font-display font-bold text-navy text-sm mb-1.5">
                        The breakdown will appear here
                      </h3>
                      <p className="text-muted text-xs max-w-xs">
                        Paste a job description on the left and parse it to see
                        the structure.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-navy uppercase tracking-wide mb-1.5">
                          Detected role
                        </p>
                        <p className="font-display font-bold text-navy text-base">
                          {jdResult.role}
                        </p>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-navy uppercase tracking-wide mb-1.5">
                          Seniority
                        </p>
                        <p className="text-sm text-ink">{jdResult.seniority}</p>
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-navy uppercase tracking-wide mb-2">
                          Must-have skills
                        </p>
                        {jdResult.mustHave.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {jdResult.mustHave.map((s, i) => (
                              <SkillChip key={i} text={s} kind="must" />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted">
                            No specific skills detected in this posting.
                          </p>
                        )}
                      </div>
                      <div className="mb-5">
                        <p className="text-xs font-bold text-navy uppercase tracking-wide mb-2">
                          Other skills mentioned
                        </p>
                        {jdResult.niceToHave.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {jdResult.niceToHave.map((s, i) => (
                              <SkillChip key={i} text={s} kind="nice" />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted">
                            None separately called out.
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy uppercase tracking-wide mb-2">
                          AI notes &amp; suggestions
                        </p>
                        {jdResult.responsibilities.length > 0 ? (
                          <ul className="space-y-2">
                            {jdResult.responsibilities.map((r, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2.5 text-sm text-ink leading-relaxed"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-forest mt-2 shrink-0"></span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted">
                            No additional notes generated.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ════════════ ABOUT SECTION ════════════ */}
          {activeSection === "about" && (
            <section>
              <div className="mb-8">
                <h1 className="font-display font-extrabold text-navy text-2xl md:text-[28px] tracking-tight mb-1.5">
                  About us
                </h1>
                <p className="text-muted text-sm">
                  Why we built CareerGPT, and who's behind it.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
                <div className="bg-white rounded-2xl border border-hairline/60 p-6 md:p-8 card-shadow">
                  <span className="inline-flex items-center gap-1.5 bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-5">
                    Our story
                  </span>
                  <h2 className="font-display font-bold text-navy text-lg mb-3">
                    Built by students, for students.
                  </h2>
                  <p className="text-sm text-ink leading-relaxed mb-4">
                    Every application season looks the same: a dozen browser
                    tabs, a half-updated spreadsheet, and a resume that's never
                    quite tailored enough. We built CareerGPT because we lived
                    that chaos ourselves — applying to internships across job
                    boards, referrals, email threads, and LinkedIn DMs, with no
                    single place to see where anything stood.
                  </p>
                  <p className="text-sm text-ink leading-relaxed mb-4">
                    CareerGPT pulls all of it into one command centre: a tracker
                    that doesn't lie to you, an AI that reads job descriptions
                    so you don't have to skim them at 1am, and an interview
                    practice space that actually gives you a score instead of
                    just "good luck."
                  </p>
                  <p className="text-sm text-ink leading-relaxed">
                    This project started as a hackathon build — three of us
                    split across frontend, integration, and backend — built in
                    the same spirit it's meant to support: organized, fast, and
                    a little less stressful than the way we used to do it.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="bg-navy rounded-2xl p-6 relative overflow-hidden">
                    <div className="cta-glow absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"></div>
                    <p className="text-xs font-bold text-lime uppercase tracking-wider mb-3 relative z-10">
                      The team
                    </p>
                    <ul className="space-y-3 relative z-10">
                      <li className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-lime text-navy text-xs font-bold flex items-center justify-center shrink-0">
                          FE
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Frontend &amp; product design
                          </p>
                          <p className="text-xs text-white/55">
                            Interface, design system, user experience
                          </p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center shrink-0">
                          IN
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Integration &amp; logic
                          </p>
                          <p className="text-xs text-white/55">
                            Connecting frontend to backend, app logic
                          </p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-coral text-white text-xs font-bold flex items-center justify-center shrink-0">
                          BE
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Backend &amp; database
                          </p>
                          <p className="text-xs text-white/55">
                            AI parsing, scoring, data storage
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl border border-hairline/60 p-6 card-shadow">
                    <p className="text-xs font-bold text-navy uppercase tracking-wide mb-3">
                      Get in touch
                    </p>
                    <p className="text-sm text-muted leading-relaxed mb-4">
                      Found a bug, or have an idea that would make this more
                      useful? We'd genuinely like to hear it.
                    </p>
                    <a
                      href="mailto:hello@careergpt.app"
                      className="text-sm font-semibold text-forest hover:text-navy transition-colors inline-flex items-center gap-1.5"
                    >
                      hello@careergpt.app
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ════════════ PROFILE SECTION ════════════ */}
          {activeSection === "settings" && (
            <section>
              <div className="mb-8">
                <h1 className="font-display font-extrabold text-navy text-2xl md:text-[28px] tracking-tight mb-1.5">
                  Profile
                </h1>
                <p className="text-muted text-sm">
                  Update your profile details.
                </p>
              </div>

              <div className="max-w-2xl bg-white rounded-2xl border border-hairline/60 p-6 md:p-7 card-shadow">
                <form onSubmit={handleSaveSettings}>
                  <div className="mb-4">
                    <label
                      htmlFor="settingsName"
                      className="block text-xs font-bold text-navy uppercase tracking-wide mb-2"
                    >
                      Full name
                    </label>
                    <input
                      id="settingsName"
                      type="text"
                      value={sName}
                      onChange={(e) => setSName(e.target.value)}
                      className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="settingsRole"
                      className="block text-xs font-bold text-navy uppercase tracking-wide mb-2"
                    >
                      Current role / status
                    </label>
                    <input
                      id="settingsRole"
                      type="text"
                      value={sRole}
                      onChange={(e) => setSRole(e.target.value)}
                      className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="settingsExpectedRole"
                      className="block text-xs font-bold text-navy uppercase tracking-wide mb-2"
                    >
                      Expected job role
                    </label>
                    <input
                      id="settingsExpectedRole"
                      type="text"
                      value={sExpected}
                      onChange={(e) => setSExpected(e.target.value)}
                      className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label
                        htmlFor="settingsLinkedin"
                        className="block text-xs font-bold text-navy uppercase tracking-wide mb-2"
                      >
                        LinkedIn URL
                      </label>
                      <input
                        id="settingsLinkedin"
                        type="url"
                        value={sLinkedin}
                        onChange={(e) => setSLinkedin(e.target.value)}
                        className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="settingsGithub"
                        className="block text-xs font-bold text-navy uppercase tracking-wide mb-2"
                      >
                        GitHub URL
                      </label>
                      <input
                        id="settingsGithub"
                        type="url"
                        value={sGithub}
                        onChange={(e) => setSGithub(e.target.value)}
                        className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary px-7 py-3 rounded-full text-sm font-bold"
                  >
                    Save changes
                  </button>
                  {settingsSaved && (
                    <p
                      role="status"
                      className="text-sm font-semibold text-forest mt-3"
                    >
                      Changes saved.
                    </p>
                  )}
                </form>

                <div className="border-t border-hairline mt-7 pt-6">
                  <button
                    onClick={handleLogout}
                    className="text-sm font-semibold text-coral hover:text-navy transition-colors flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 17l5-5-5-5M21 12H9"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
