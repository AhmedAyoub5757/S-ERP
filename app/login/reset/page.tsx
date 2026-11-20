'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { updatePassword } from '@/app/login/actions'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [clientError, setClientError] = React.useState<string | null>(null)

  // Password rules validation
  const hasMinLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && passwordsMatch

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!isValid) {
      e.preventDefault()
      if (!passwordsMatch) {
        setClientError('Passwords do not match.')
      } else {
        setClientError('Please satisfy all password security requirements.')
      }
    }
  }

  const activeError = clientError || error

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
              Security Center
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to sign in</span>
        </Link>

        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Set New Credentials
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
              Create new password
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your new password must meet institutional security standards to protect student data.
            </p>
          </div>

          {activeError && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive animate-in fade-in-50"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{activeError}</span>
            </div>
          )}

          <form action={updatePassword} onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold tracking-wide text-foreground"
              >
                New password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setClientError(null)
                  }}
                  placeholder="Enter new strong password"
                  className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-11 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold tracking-wide text-foreground"
              >
                Confirm new password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setClientError(null)
                  }}
                  placeholder="Re-enter new password"
                  className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-11 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements Checklist */}
            <div className="rounded-lg border border-border/80 bg-muted/40 p-3 space-y-2">
              <p className="text-[11px] font-semibold tracking-wide text-foreground uppercase">
                Password Requirements
              </p>
              <ul className="grid grid-cols-2 gap-1 text-xs">
                <li
                  className={cn(
                    'flex items-center gap-1.5 transition-colors',
                    hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                  )}
                >
                  {hasMinLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-muted-foreground/60" />}
                  <span>At least 8 characters</span>
                </li>
                <li
                  className={cn(
                    'flex items-center gap-1.5 transition-colors',
                    hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                  )}
                >
                  {hasUpper ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-muted-foreground/60" />}
                  <span>Uppercase letter</span>
                </li>
                <li
                  className={cn(
                    'flex items-center gap-1.5 transition-colors',
                    hasLower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                  )}
                >
                  {hasLower ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-muted-foreground/60" />}
                  <span>Lowercase letter</span>
                </li>
                <li
                  className={cn(
                    'flex items-center gap-1.5 transition-colors',
                    hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                  )}
                >
                  {hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-muted-foreground/60" />}
                  <span>Number included</span>
                </li>
              </ul>
              {confirmPassword.length > 0 && (
                <div
                  className={cn(
                    'pt-1 text-xs flex items-center gap-1.5 font-medium',
                    passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                  )}
                >
                  {passwordsMatch ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className="group flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-xs transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Update Password</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
          Loading password reset...
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  )
}