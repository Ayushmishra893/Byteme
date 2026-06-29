"use client";

export default function AboutSection() {
  return (
    <section>
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-navy text-2xl md:text-[28px] tracking-tight mb-1.5">About us</h1>
        <p className="text-muted text-sm">Why we built CareerGPT, and who&apos;s behind it.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-hairline/60 p-6 md:p-8 card-shadow">
          <span className="inline-flex items-center gap-1.5 bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-5">
            Our story
          </span>
          <h2 className="font-display font-bold text-navy text-lg mb-3">Built by students, for students.</h2>
          <p className="text-sm text-ink leading-relaxed mb-4">
            Every application season looks the same: a dozen browser tabs, a half-updated spreadsheet, and a resume
            that&apos;s never quite tailored enough. We built CareerGPT because we lived that chaos ourselves — applying to
            internships across job boards, referrals, email threads, and LinkedIn DMs, with no single place to see
            where anything stood.
          </p>
          <p className="text-sm text-ink leading-relaxed mb-4">
            CareerGPT pulls all of it into one command centre: a tracker that doesn&apos;t lie to you, an AI that reads job
            descriptions so you don&apos;t have to skim them at 1am, and an interview practice space that actually gives
            you a score instead of just &quot;good luck.&quot;
          </p>
          <p className="text-sm text-ink leading-relaxed">
            This project started as a hackathon build — three of us split across frontend, integration, and backend —
            built in the same spirit it&apos;s meant to support: organized, fast, and a little less stressful than the
            way we used to do it.
          </p>
        </div>

        <div className="space-y-5">
          <div className="bg-navy rounded-2xl p-6 relative overflow-hidden">
            <div className="cta-glow absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"></div>
            <p className="text-xs font-bold text-lime uppercase tracking-wider mb-3 relative z-10">The team</p>
            <ul className="space-y-3 relative z-10">
              <li className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-lime text-navy text-xs font-bold flex items-center justify-center shrink-0">
                  FE
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Frontend &amp; product design</p>
                  <p className="text-xs text-white/55">Interface, design system, user experience</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center shrink-0">
                  IN
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Integration &amp; logic</p>
                  <p className="text-xs text-white/55">Connecting frontend to backend, app logic</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-coral text-white text-xs font-bold flex items-center justify-center shrink-0">
                  BE
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Backend &amp; database</p>
                  <p className="text-xs text-white/55">AI parsing, scoring, data storage</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-hairline/60 p-6 card-shadow">
            <p className="text-xs font-bold text-navy uppercase tracking-wide mb-3">Get in touch</p>
            <p className="text-sm text-muted leading-relaxed mb-4">
              Found a bug, or have an idea that would make this more useful? We&apos;d genuinely like to hear it.
            </p>
            <a
              href="mailto:hello@careergpt.app"
              className="text-sm font-semibold text-forest hover:text-navy transition-colors inline-flex items-center gap-1.5"
            >
              hello@careergpt.app
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
