"use client";

import Link from "next/link";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Homepage",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
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
  },
  {
    id: "interview",
    label: "Interview",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
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
  },
  {
    id: "jd",
    label: "AI Job Description",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
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
  },
  {
    id: "about",
    label: "About Us",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M12 11v5.5M12 8v.01"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const SETTINGS_ITEM = {
  id: "settings",
  label: "Settings",
  icon: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function NavButton({ item, active, onClick, mobile = false }) {
  return (
    <button
      onClick={onClick}
      className={`sidebar-link w-full flex items-center gap-3 px-3.5 ${mobile ? "py-3" : "py-2.5"} rounded-xl text-sm font-semibold text-left ${active ? "active" : ""}`}
    >
      {item.icon}
      {item.label}
    </button>
  );
}

export default function Navigation({
  activeSection,
  onNavigate,
  profile,
  mobileOpen,
  onToggleMobile,
}) {
  const initials =
    (profile?.fullName || "")
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <>
      {/* ================= SIDEBAR (desktop) ================= */}
      <aside className="hidden lg:flex lg:flex-col w-[248px] shrink-0 bg-white border-r border-hairline h-screen sticky top-0">
        <div className="px-6 h-[72px] flex items-center border-b border-hairline">
          <Link href="/" className="flex items-center gap-2.5">
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
        </div>

        <nav className="flex-1 px-3.5 py-6 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeSection === item.id}
              onClick={() => onNavigate(item.id)}
            />
          ))}

          <div className="pt-4 mt-4 border-t border-hairline">
            <NavButton
              item={SETTINGS_ITEM}
              active={activeSection === SETTINGS_ITEM.id}
              onClick={() => onNavigate(SETTINGS_ITEM.id)}
            />
          </div>
        </nav>

        <div className="p-3.5 border-t border-hairline">
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <span className="w-9 h-9 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">
                {profile?.fullName || "User"}
              </p>
              <p className="text-xs text-muted">Free plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE TOP BAR ================= */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-hairline">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-[8px] bg-lime flex items-center justify-center">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
            onClick={onToggleMobile}
            aria-label="Open menu"
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-navy/5"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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

      {/* ================= MOBILE SLIDE-DOWN NAV ================= */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 z-40 bg-white border-b border-hairline mobile-menu ${mobileOpen ? "open" : ""}`}
      >
        <nav className="flex flex-col gap-1 p-4">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeSection === item.id}
              onClick={() => onNavigate(item.id)}
              mobile
            />
          ))}
          <button
            onClick={() => onNavigate(SETTINGS_ITEM.id)}
            className={`sidebar-link w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-left border-t border-hairline mt-2 pt-4 ${
              activeSection === SETTINGS_ITEM.id ? "active" : ""
            }`}
          >
            {SETTINGS_ITEM.icon}
            {SETTINGS_ITEM.label}
          </button>
        </nav>
      </div>
    </>
  );
}
