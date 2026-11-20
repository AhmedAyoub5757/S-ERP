'use client'

import * as React from 'react'
import Link from 'next/link'
import { login } from '@/app/login/actions'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoginForm({
  initialError,
  resetSuccess,
}: {
  initialError?: string
  resetSuccess?: boolean
}) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [rememberMe, setRememberMe] = React.useState(false)
  const [clientError, setClientError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (clientError) setClientError(null)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (clientError) setClientError(null)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!email) {
      e.preventDefault()
      setClientError('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      e.preventDefault()
      setClientError('Please enter a valid email address.')
      return
    }

    if (!password) {
      e.preventDefault()
      setClientError('Please enter your password.')
      return
    }

    setIsSubmitting(true)
  }

  const activeError = clientError || initialError

  return (
    <div className="w-full max-w-[390px] space-y-5">
      {/* Editorial Title */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          Academic Portal
        </p>
        <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-[34px]">
          Welcome back
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sign in with your institutional credentials to access your workspace.
        </p>
      </div>

      {/* Success banner after password reset */}
      {resetSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in-50"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Your password has been updated. Please sign in below.</span>
        </div>
      )}

      {/* Friendly Error Banner */}
      {activeError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-2 text-xs text-destructive animate-in fade-in-50"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}

      {/* Login Form */}
      <form action={login} onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email Field */}
        <div className="space-y-1">
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
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
              disabled={isSubmitting}
              placeholder="e.g. principal@greenwood.edu"
              className={cn(
                'h-10 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground shadow-2xs outline-none transition duration-150 placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold tracking-wide text-foreground"
            >
              Password
            </label>
            <Link
              href="/login/forgot"
              className="text-[11px] font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              disabled={isSubmitting}
              placeholder="Enter account password"
              className={cn(
                'h-10 w-full rounded-lg border border-input bg-card pl-10 pr-10 text-sm text-foreground shadow-2xs outline-none transition duration-150 placeholder:text-muted-foreground/60',
                'focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 transition-transform active:scale-90" />
              ) : (
                <Eye className="h-4 w-4 transition-transform active:scale-90" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me Option */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              name="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-primary/20 accent-primary"
            />
            <span>Remember this device</span>
          </label>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'group relative mt-1 flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-xs transition-all duration-200',
            'hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <span>Sign in to Dashboard</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      {/* Footer reassurance */}
      <div className="border-t border-border/70 pt-3 text-center">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Authorized personnel & students only · Greenwood ERP
        </p>
      </div>
    </div>
  )
}
