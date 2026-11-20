import { login } from './actions'
import { LoginSubmit } from '@/components/login-submit'
import { ArrowRight, GraduationCap, ShieldCheck, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="login-grid min-h-screen bg-[#18372a] text-white">
      <section className="login-visual relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between p-10 xl:p-14">
        <div className="login-orb login-orb-one" />
        <div className="login-orb login-orb-two" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Greenwood</p>
            <p className="text-xs text-white/60">School Management</p>
          </div>
        </div>
        <div className="relative z-10 max-w-xl space-y-6">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#b8c9ad]">Greenwood School</p>
          <h1 className="font-serif text-5xl font-medium leading-[1.02] xl:text-6xl">The everyday record of a thriving school.</h1>
          <p className="max-w-md text-base leading-7 text-white/65">
            Students, staff, attendance, admissions, and finances—together in one calm workspace.
          </p>
          <div className="grid max-w-lg grid-cols-2 gap-3 pt-3">
            <div className="login-feature"><ShieldCheck className="h-5 w-5 text-[#b8c9ad]" /><span>Role-based access</span></div>
            <div className="login-feature"><Users className="h-5 w-5 text-[#b8c9ad]" /><span>Whole-school register</span></div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/40">Greenwood School ERP</p>
      </section>

      <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-5 text-[#1d2d25] sm:px-10">
        <form action={login} className="login-form w-full max-w-[410px] space-y-5">
          <div className="mb-8 space-y-2 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#18372a] text-white"><GraduationCap className="h-5 w-5" /></div>
              <span className="font-semibold">Greenwood School</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#667768]">Sign in</p>
            <h2 className="font-serif text-4xl font-medium tracking-tight">Welcome back</h2>
            <p className="text-sm text-[#68736c]">Enter your account details to continue.</p>
          </div>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[#34443a]">Email address</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="name@school.com" className="h-12 w-full rounded-md border border-[#d7d8d1] bg-[#fffef9] px-4 text-sm outline-none transition duration-200 placeholder:text-[#9aa39d] focus:border-[#4f705f] focus:ring-3 focus:ring-[#4f705f]/10" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[#34443a]">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="Enter your password" className="h-12 w-full rounded-md border border-[#d7d8d1] bg-[#fffef9] px-4 text-sm outline-none transition duration-200 placeholder:text-[#9aa39d] focus:border-[#4f705f] focus:ring-3 focus:ring-[#4f705f]/10" />
          </div>
          <LoginSubmit />
          <p className="text-center text-xs text-[#929990]">Authorized staff and student access only</p>
        </form>
      </main>
    </div>
  )
}