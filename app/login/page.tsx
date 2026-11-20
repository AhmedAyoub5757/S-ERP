import { LoginForm } from '@/components/login-form'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  GraduationCap,
  ShieldCheck,
  Users,
  CalendarCheck,
  Sparkles,
  BookOpen,
  Lock,
  Clock,
  Compass,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; resetSuccess?: string }>
}) {
  const params = await searchParams
  const error = params.error
  const resetSuccess = params.resetSuccess === 'true'

  return (
    <div className="relative h-screen max-h-screen w-full overflow-hidden lg:grid lg:grid-cols-[1.15fr_0.85fr] bg-background text-foreground">
      {/* Top right theme switcher with circular ripple animation */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle
          variant="outline"
          className="h-9 w-9 rounded-xl border-border bg-card/85 shadow-2xs backdrop-blur-md"
        />
      </div>

      {/* Left Visual Editorial Showcase (Hidden on Mobile) */}
      <section className="relative hidden h-screen max-h-screen flex-col justify-between overflow-hidden bg-primary p-10 xl:p-14 text-primary-foreground lg:flex select-none">
        {/* Ambient atmospheric radial glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
          {/* Subtle architectural geometry */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Top Branding Emblem */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-foreground/15 ring-1 ring-primary-foreground/25 shadow-xs backdrop-blur-md">
            <GraduationCap className="h-6 w-6 text-primary-foreground" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-medium tracking-tight text-primary-foreground">
                Greenwood Academy
              </span>
              <span className="rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-primary-foreground/80">
                ERP 2.0
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70 font-medium">
              School Register & Records
            </p>
          </div>
        </div>

        {/* Center: Visually Rich Floating Glassmorphic Workspace Preview */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1 text-[11px] font-medium tracking-wide text-primary-foreground/90 backdrop-blur-md ring-1 ring-primary-foreground/20">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>Campus Operational · Academic Year 2026-27</span>
            </div>

            <h1 className="font-serif text-3xl font-normal leading-[1.12] tracking-tight text-primary-foreground xl:text-4xl">
              Where scholarship meets calm precision.
            </h1>
          </div>

          {/* Floating Glassmorphic Campus Card Preview */}
          <div className="relative rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-5 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-primary-foreground/15 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-primary-foreground">
                  Live School Register
                </span>
              </div>
              <span className="text-[11px] font-mono text-primary-foreground/70">
                Term 2 · Day 42
              </span>
            </div>

            {/* Visual metrics preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 p-3">
                <div className="flex items-center justify-between text-primary-foreground/75 text-[11px]">
                  <span>Active Roster</span>
                  <Users className="h-3.5 w-3.5 text-primary-foreground/80" />
                </div>
                <div className="mt-1 font-serif text-2xl font-medium tracking-tight text-primary-foreground tabular-nums">
                  1,280
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-300 font-medium">
                  <span>+4.2% enrollment</span>
                </div>
              </div>

              <div className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 p-3">
                <div className="flex items-center justify-between text-primary-foreground/75 text-[11px]">
                  <span>Attendance</span>
                  <CalendarCheck className="h-3.5 w-3.5 text-primary-foreground/80" />
                </div>
                <div className="mt-1 font-serif text-2xl font-medium tracking-tight text-primary-foreground tabular-nums">
                  98.4%
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-300 font-medium">
                  <span>Normal attendance</span>
                </div>
              </div>
            </div>

            {/* Live Lecture Pill */}
            <div className="flex items-center justify-between rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-3.5 py-2.5 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <Clock className="h-4 w-4 shrink-0 text-amber-300" />
                <div className="truncate">
                  <p className="font-semibold text-primary-foreground truncate">
                    Period 3 · Advanced Mathematics
                  </p>
                  <p className="text-[10px] text-primary-foreground/70">
                    Grade 11-A · Science Wing Hall 4
                  </p>
                </div>
              </div>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 shrink-0">
                In Session
              </span>
            </div>
          </div>

          {/* Floating Security Badge */}
          <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span>Multi-role access control with Supabase Row-Level Security</span>
          </div>
        </div>

        {/* Bottom School Motto / Seal */}
        <div className="relative z-10 flex items-center justify-between text-xs text-primary-foreground/60 border-t border-primary-foreground/15 pt-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary-foreground/60" />
            <span className="italic font-serif">Scientia et Virtus — Knowledge and Virtue</span>
          </div>
          <span className="font-mono text-[11px]">Est. 1994</span>
        </div>
      </section>

      {/* Right Form Pane — Strictly contained in 100vh with NO SCROLL */}
      <main className="flex h-screen max-h-screen overflow-hidden flex-col items-center justify-center p-6 sm:p-10 lg:p-12">
        {/* Mobile Header Branding */}
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <GraduationCap className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-foreground">Greenwood</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              School Management ERP
            </p>
          </div>
        </div>

        <LoginForm initialError={error} resetSuccess={resetSuccess} />
      </main>
    </div>
  )
}
