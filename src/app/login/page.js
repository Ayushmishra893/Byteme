"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

/* ── helpers ── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function scorePassword(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

const STRENGTH_LABELS = [
  "Too short",
  "Weak password",
  "Good password",
  "Strong password",
  "Excellent password",
];
const STRENGTH_COLORS = [
  "bg-coral",
  "bg-coral",
  "bg-coral",
  "bg-forest",
  "bg-lime",
];
const STRENGTH_HINT = "Use 8+ characters with a number";

/* ── sub-components ── */

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.82-.07-1.6-.2-2.36H12v4.51h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.86c2.26-2.08 3.56-5.15 3.56-8.78Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.86-3.01c-1.07.72-2.45 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H1.27v3.12C3.25 21.3 7.26 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.25 14.26a7.2 7.2 0 0 1-.38-2.26c0-.79.14-1.55.38-2.26V6.62H1.27A11.95 11.95 0 0 0 0 12c0 1.93.47 3.76 1.27 5.38l3.98-3.12Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.79l3.42-3.42C17.95 1.18 15.24 0 12 0 7.26 0 3.25 2.7 1.27 6.62l3.98 3.12C6.2 6.89 8.86 4.77 12 4.77Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#14233D">
      <path d="M19.04 12.92c-.03-2.07 1.69-3.06 1.77-3.11-.96-1.41-2.46-1.6-3-1.62-1.27-.13-2.49.75-3.14.75-.65 0-1.66-.73-2.73-.71-1.4.02-2.71.82-3.42 2.07-1.46 2.54-.37 6.3 1.05 8.36.69 1 1.51 2.1 2.59 2.06 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.7.65 1.12-.02 1.83-1 2.51-2 .79-1.17 1.12-2.3 1.14-2.36-.02-.01-2.19-.84-2.16-3.42Zm-2.86-9.18c.58-.7.97-1.67.86-2.64-.83.03-1.84.55-2.44 1.24-.53.61-1 1.6-.88 2.53.91.07 1.85-.46 2.46-1.13Z" />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
        stroke="#6B7280"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="1.6" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18M10.6 5.2A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a14.4 14.4 0 0 1-3.1 3.9M6.5 6.4C3.6 8.3 1.5 12 1.5 12s3.5 7 10.5 7c1.3 0 2.5-.2 3.6-.6M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="#6B7280"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerIcon() {
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

function SocialButtons({ onGoogleClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      <button
        type="button"
        onClick={onGoogleClick}
        className="btn-social px-4 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2.5"
      >
        <GoogleIcon />
        Google
      </button>
      <button
        type="button"
        className="btn-social px-4 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2.5"
      >
        <AppleIcon />
        Apple
      </button>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="h-px flex-1 bg-hairline"></span>
      <span className="text-xs text-muted font-medium">or with email</span>
      <span className="h-px flex-1 bg-hairline"></span>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="field-error text-xs text-coral font-medium mt-1.5">
      {message}
    </p>
  );
}

/* ── main component ── */

export default function LoginPage() {
  const router = useRouter();

  /* tab */
  const [activeTab, setActiveTab] = useState("login");

  /* firebase error */
  const [firebaseError, setFirebaseError] = useState(null);

  /* ── login form state ── */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" });
  const [loginStatus, setLoginStatus] = useState({ message: "", kind: "" });
  const [loginLoading, setLoginLoading] = useState(false);

  /* ── signup form state ── */
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordVisible, setSignupPasswordVisible] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signupErrors, setSignupErrors] = useState({
    name: "",
    email: "",
    password: "",
    terms: "",
  });
  const [signupStatus, setSignupStatus] = useState({ message: "", kind: "" });
  const [signupLoading, setSignupLoading] = useState(false);

  /* password strength */
  const signupScore = signupPassword ? scorePassword(signupPassword) : 0;
  const strengthBarColor = signupPassword
    ? STRENGTH_COLORS[signupScore]
    : "bg-hairline";
  const strengthLabelText = signupPassword
    ? signupPassword.length < 8
      ? STRENGTH_HINT
      : STRENGTH_LABELS[signupScore]
    : STRENGTH_HINT;

  /* ── Google sign-in (popup, not redirect) ── */
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await fetch("/api/auth/save-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }),
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setFirebaseError(err.message);
    }
  };

  /* ── login submit (real Firebase email/password) ── */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errors = { email: "", password: "" };
    let valid = true;

    if (!loginEmail.trim()) {
      errors.email = "Enter your email address.";
      valid = false;
    } else if (!EMAIL_RE.test(loginEmail.trim())) {
      errors.email = "Enter a valid email address.";
      valid = false;
    }

    if (!loginPassword) {
      errors.password = "Enter your password.";
      valid = false;
    }

    setLoginErrors(errors);
    if (!valid) return;

    setLoginLoading(true);
    setLoginStatus({ message: "", kind: "" });

    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      setLoginLoading(false);
      setLoginStatus({
        message: "You're logged in. Redirecting to your dashboard…",
        kind: "success",
      });
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (err) {
      console.error(err);
      setLoginLoading(false);
      setLoginStatus({ message: err.message, kind: "error" });
    }
  };

  /* ── forgot password ── */
  const handleForgotPassword = () => {
    setLoginErrors((prev) => ({ ...prev, password: "" }));
    setLoginStatus({
      message: "If an account exists for that email, we've sent a reset link.",
      kind: "success",
    });
  };

  /* ── signup submit (real Firebase email/password) ── */
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const errors = { name: "", email: "", password: "", terms: "" };
    let valid = true;

    if (!signupName.trim()) {
      errors.name = "Enter your full name.";
      valid = false;
    }

    if (!signupEmail.trim()) {
      errors.email = "Enter your email address.";
      valid = false;
    } else if (!EMAIL_RE.test(signupEmail.trim())) {
      errors.email = "Enter a valid email address.";
      valid = false;
    }

    if (signupPassword.length < 8) {
      errors.password = "Password must be at least 8 characters.";
      valid = false;
    }

    if (!agreeTerms) {
      errors.terms = "Please accept the Terms and Privacy Policy to continue.";
      valid = false;
    }

    setSignupErrors(errors);
    if (!valid) return;

    setSignupLoading(true);
    setSignupStatus({ message: "", kind: "" });

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        signupEmail.trim(),
        signupPassword
      );
      const user = cred.user;

      await fetch("/api/auth/save-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          displayName: signupName.trim(),
          email: user.email,
          photoURL: "",
        }),
      });

      setSignupLoading(false);
      setSignupStatus({
        message: "Account created. Setting up your dashboard…",
        kind: "success",
      });
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (err) {
      console.error(err);
      setSignupLoading(false);
      setSignupStatus({ message: err.message, kind: "error" });
    }
  };

  /* ── render ── */
  return (
    <>
      {/* ── NAV ── */}
      <header className="border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <span className="w-8 h-8 rounded-[10px] bg-lime flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="8.5"
                    stroke="#14233D"
                    strokeWidth="1.6"
                  />
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
              <span className="font-display font-extrabold text-lg text-navy tracking-tight">
                CareerGPT
              </span>
            </Link>

            <Link
              href="/"
              className="nav-link text-sm font-medium pb-1 hidden sm:inline-flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[44%_56%] gap-12 lg:gap-10 items-center min-h-[70vh]">
          {/* ── LEFT: AUTH CARD ── */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Firebase error banner */}
            {firebaseError && (
              <p className="text-sm font-semibold text-coral text-center mb-6">
                {firebaseError}
              </p>
            )}

            {/* Tab switcher */}
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="grid grid-cols-2 bg-panel border border-hairline rounded-full p-1 mb-8"
            >
              <button
                id="tabLogin"
                role="tab"
                aria-selected={activeTab === "login"}
                aria-controls="panelLogin"
                onClick={() => setActiveTab("login")}
                className={`auth-tab px-4 py-2.5 rounded-full text-sm font-bold transition-all${activeTab === "login" ? " active" : ""}`}
              >
                Log in
              </button>
              <button
                id="tabSignup"
                role="tab"
                aria-selected={activeTab === "signup"}
                aria-controls="panelSignup"
                onClick={() => setActiveTab("signup")}
                className={`auth-tab px-4 py-2.5 rounded-full text-sm font-bold transition-all${activeTab === "signup" ? " active" : ""}`}
              >
                Sign up
              </button>
            </div>

            {/* ── LOGIN PANEL ── */}
            {activeTab === "login" && (
              <div id="panelLogin" role="tabpanel" aria-labelledby="tabLogin">
                <h1 className="font-display font-extrabold text-navy text-[28px] md:text-[32px] tracking-tight mb-2">
                  Welcome back
                </h1>
                <p className="text-muted text-sm leading-relaxed mb-8">
                  Log in to pick up right where your job search left off.
                </p>

                <SocialButtons onGoogleClick={handleGoogleSignIn} />
                <Divider />

                <form onSubmit={handleLoginSubmit} noValidate>
                  {/* Email */}
                  <div className="mb-4">
                    <label
                      htmlFor="loginEmail"
                      className="block text-xs font-bold text-navy uppercase tracking-wide mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="loginEmail"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@school.edu"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        setLoginErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      className={`auth-input w-full px-4 py-3 rounded-xl text-sm${loginErrors.email ? " input-error" : ""}`}
                      aria-invalid={!!loginErrors.email}
                    />
                    <FieldError message={loginErrors.email} />
                  </div>

                  {/* Password */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="loginPassword"
                        className="block text-xs font-bold text-navy uppercase tracking-wide"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs font-semibold text-forest hover:text-navy transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="loginPassword"
                        name="password"
                        type={loginPasswordVisible ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          setLoginErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        className={`auth-input w-full px-4 py-3 pr-11 rounded-xl text-sm${loginErrors.password ? " input-error" : ""}`}
                        aria-invalid={!!loginErrors.password}
                      />
                      <button
                        type="button"
                        aria-label={
                          loginPasswordVisible
                            ? "Hide password"
                            : "Show password"
                        }
                        onClick={() => setLoginPasswordVisible((v) => !v)}
                        className="password-toggle absolute right-3.5 top-1/2 -translate-y-1/2"
                      >
                        {loginPasswordVisible ? (
                          <EyeClosedIcon />
                        ) : (
                          <EyeOpenIcon />
                        )}
                      </button>
                    </div>
                    <FieldError message={loginErrors.password} />
                  </div>

                  {/* Remember me */}
                  <label className="flex items-center gap-2.5 mb-7 mt-5 cursor-pointer select-none">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="auth-checkbox"
                    />
                    <span className="text-sm text-muted">
                      Keep me logged in
                    </span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className={`btn-primary w-full px-7 py-3.5 rounded-full text-base font-bold flex items-center justify-center gap-2.5${loginLoading ? " opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {loginLoading ? (
                      <SpinnerIcon />
                    ) : (
                      <span className="btn-label">Log in</span>
                    )}
                  </button>

                  {/* Status */}
                  {loginStatus.message && (
                    <p
                      role="status"
                      aria-live="polite"
                      className={`text-sm font-semibold text-center mt-4${loginStatus.kind === "error" ? " text-coral" : " text-forest"}`}
                    >
                      {loginStatus.message}
                    </p>
                  )}
                </form>

                <p className="text-center text-sm text-muted mt-7">
                  New to CareerGPT?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="font-semibold text-forest hover:text-navy transition-colors"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            )}

            {/* ── SIGN UP PANEL ── */}
            {activeTab === "signup" && (
              <div id="panelSignup" role="tabpanel" aria-labelledby="tabSignup">
                <h1 className="font-display font-extrabold text-navy text-[28px] md:text-[32px] tracking-tight mb-2">
                  Create your account
                </h1>
                <p className="text-muted text-sm leading-relaxed mb-8">
                  Free for students. Set up your command centre in under a
                  minute.
                </p>

                <SocialButtons onGoogleClick={handleGoogleSignIn} />
                <Divider />

                <form onSubmit={handleSignupSubmit} noValidate>
                  {/* Full name */}
                  <div className="mb-4">
                    <label
                      htmlFor="signupName"
                      className="block text-xs font-bold text-navy uppercase tracking-wide mb-2"
                    >
                      Full name
                    </label>
                    <input
                      id="signupName"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Riya Malhotra"
                      value={signupName}
                      onChange={(e) => {
                        setSignupName(e.target.value);
                        setSignupErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      className={`auth-input w-full px-4 py-3 rounded-xl text-sm${signupErrors.name ? " input-error" : ""}`}
                      aria-invalid={!!signupErrors.name}
                    />
                    <FieldError message={signupErrors.name} />
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label
                      htmlFor="signupEmail"
                      className="block text-xs font-bold text-navy uppercase tracking-wide mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="signupEmail"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@school.edu"
                      value={signupEmail}
                      onChange={(e) => {
                        setSignupEmail(e.target.value);
                        setSignupErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      className={`auth-input w-full px-4 py-3 rounded-xl text-sm${signupErrors.email ? " input-error" : ""}`}
                      aria-invalid={!!signupErrors.email}
                    />
                    <FieldError message={signupErrors.email} />
                  </div>

                  {/* Password + strength meter */}
                  <div className="mb-2">
                    <label
                      htmlFor="signupPassword"
                      className="block text-xs font-bold text-navy uppercase tracking-wide mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signupPassword"
                        name="password"
                        type={signupPasswordVisible ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={signupPassword}
                        onChange={(e) => {
                          setSignupPassword(e.target.value);
                          setSignupErrors((prev) => ({
                            ...prev,
                            password: "",
                          }));
                        }}
                        className={`auth-input w-full px-4 py-3 pr-11 rounded-xl text-sm${signupErrors.password ? " input-error" : ""}`}
                        aria-invalid={!!signupErrors.password}
                      />
                      <button
                        type="button"
                        aria-label={
                          signupPasswordVisible
                            ? "Hide password"
                            : "Show password"
                        }
                        onClick={() => setSignupPasswordVisible((v) => !v)}
                        className="password-toggle absolute right-3.5 top-1/2 -translate-y-1/2"
                      >
                        {signupPasswordVisible ? (
                          <EyeClosedIcon />
                        ) : (
                          <EyeOpenIcon />
                        )}
                      </button>
                    </div>
                    <FieldError message={signupErrors.password} />

                    {/* Strength meter */}
                    <div className="mt-2.5">
                      <div className="flex gap-1.5 mb-1.5">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className={`strength-bar h-1.5 flex-1 rounded-full ${signupPassword && i < signupScore ? strengthBarColor : "bg-hairline"}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted font-medium">
                        {strengthLabelText}
                      </p>
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-2.5 mb-7 mt-5 cursor-pointer select-none">
                    <input
                      id="agreeTerms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        setSignupErrors((prev) => ({ ...prev, terms: "" }));
                      }}
                      className="auth-checkbox mt-0.5"
                    />
                    <span className="text-sm text-muted leading-snug">
                      I agree to the{" "}
                      <a
                        href="#"
                        className="font-semibold text-forest hover:text-navy transition-colors"
                      >
                        Terms
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="font-semibold text-forest hover:text-navy transition-colors"
                      >
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {signupErrors.terms && (
                    <p className="field-error text-xs text-coral font-medium -mt-5 mb-5">
                      {signupErrors.terms}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={signupLoading}
                    className={`btn-primary w-full px-7 py-3.5 rounded-full text-base font-bold flex items-center justify-center gap-2.5${signupLoading ? " opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {signupLoading ? (
                      <SpinnerIcon />
                    ) : (
                      <span className="btn-label">Create account</span>
                    )}
                  </button>

                  {/* Status */}
                  {signupStatus.message && (
                    <p
                      role="status"
                      aria-live="polite"
                      className={`text-sm font-semibold text-center mt-4${signupStatus.kind === "error" ? " text-coral" : " text-forest"}`}
                    >
                      {signupStatus.message}
                    </p>
                  )}
                </form>

                <p className="text-center text-sm text-muted mt-7">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="font-semibold text-forest hover:text-navy transition-colors"
                  >
                    Log in
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: VISUAL PANEL ── */}
          <div className="hidden lg:block relative">
            <div className="bg-navy rounded-xl2 p-10 md:p-12 relative overflow-hidden h-full flex flex-col justify-between min-h-[560px]">
              <div className="cta-glow absolute -right-20 -top-20 w-[380px] h-[380px] rounded-full pointer-events-none"></div>

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 bg-lime/15 text-lime text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-7">
                  One command centre
                </span>
                <h2 className="font-display font-extrabold text-white text-[30px] md:text-[36px] leading-[1.15] tracking-tight max-w-sm">
                  Every application, organized the moment you sign in.
                </h2>
              </div>

              {/* mini tracker preview */}
              <div className="relative z-10 tracker-preview-panel border border-white/10 rounded-xl2 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-display font-bold text-white text-sm">
                    Your week at a glance
                  </p>
                  <span className="text-[11px] text-white/60 bg-white/10 px-2.5 py-1 rounded-full">
                    3 interviews
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 tracker-preview-row rounded-lg p-2.5">
                    <span className="w-7 h-7 rounded-full bg-lime/90 text-navy text-[10px] font-bold flex items-center justify-center shrink-0">
                      N
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-white leading-tight truncate">
                        Interview — SWE Intern
                      </p>
                      <p className="text-[11px] text-white/55">
                        Nimbus · Tomorrow, 10:00 AM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 tracker-preview-row rounded-lg p-2.5">
                    <span className="w-7 h-7 rounded-full bg-forest text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      M
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-white leading-tight truncate">
                        Offer call — Data Intern
                      </p>
                      <p className="text-[11px] text-white/55">
                        Mosaic · Thursday, 2:30 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 tracker-preview-row rounded-lg p-2.5">
                    <span className="w-7 h-7 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      V
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-white leading-tight truncate">
                        Follow-up due — Ops Associate
                      </p>
                      <p className="text-[11px] text-white/55">
                        Vesta Labs · Today
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="relative z-10 text-white/50 text-xs mt-7">
                Trusted by students placed at Goldman, Meta, Spotify, Notion and
                more.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
