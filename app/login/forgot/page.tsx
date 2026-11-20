import Link from 'next/link'
import { requestPasswordReset } from '@/app/login/actions'
import { ThemeToggle } from '@/components/theme-toggle'
import { GraduationCap, ArrowLeft, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams
  const error = params.error
  const isSuccess = params.success === 'true'

  return (
    <div className="relative flex h-screen max-h-screen overflow-hidden flex-col items-center justify-center bg-background px-6 py-6 text-foreground sm:px-12">
      {/* Top right theme switcher */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle variant="outline" className="bg-card/80 backdrop-blur-md" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Greenwood
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Account Recovery
            </p>
          </div>
        </div>

        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to sign in</span>
        </Link>

        {isSuccess ? (
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                Check your email
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If an account exists with that email address, we have sent instructions to reset your password. The link expires in 60 minutes.
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <Link
                href="/login"
                className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-xs transition hover:opacity-90"
              >
                Return to sign in
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Security & Access
              </p>
              <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
                Reset your password
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enter your institutional email address and we will send you a secure link to create a new password.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive animate-in fade-in-50"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form action={requestPasswordReset} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold tracking-wide text-foreground"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@school.com"
                    autoComplete="email"
                    className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="group flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-xs transition-all hover:opacity-90 active:scale-[0.99]"
              >
                <span>Send Reset Link</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Having trouble? Contact the Greenwood IT helpdesk at{' '}
            <span className="font-medium text-foreground">support@greenwood.edu</span>
          </p>
        </div>
      </div>
    </div>
  )
}
