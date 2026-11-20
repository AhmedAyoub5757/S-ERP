'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { mapErrorMessage, logTechnicalError } from '@/lib/error-messages'

export async function login(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent('Please enter both email and password.')}`)
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      logTechnicalError('login.signInWithPassword', error)
      const userMessage = mapErrorMessage(error, 'Email or password is incorrect.')
      redirect(`/login?error=${encodeURIComponent(userMessage)}`)
    }
  } catch (err: any) {
    if (err?.digest?.includes('NEXT_REDIRECT')) {
      throw err
    }
    logTechnicalError('login.unexpected', err)
    const userMessage = mapErrorMessage(err, 'Email or password is incorrect.')
    redirect(`/login?error=${encodeURIComponent(userMessage)}`)
  }

  redirect('/dashboard')
}

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()

  if (!email) {
    redirect(`/login/forgot?error=${encodeURIComponent('Please enter your email address.')}`)
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login/reset`,
    })

    if (error) {
      logTechnicalError('requestPasswordReset', error)
      const userMessage = mapErrorMessage(error, "We couldn't process your reset request. Please try again.")
      redirect(`/login/forgot?error=${encodeURIComponent(userMessage)}`)
    }
  } catch (err: any) {
    if (err?.digest?.includes('NEXT_REDIRECT')) {
      throw err
    }
    logTechnicalError('requestPasswordReset.unexpected', err)
    redirect(`/login/forgot?error=${encodeURIComponent("We couldn't process your reset request. Please try again.")}`)
  }

  redirect('/login/forgot?success=true')
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    redirect(`/login/reset?error=${encodeURIComponent('Please complete both password fields.')}`)
  }

  if (password !== confirmPassword) {
    redirect(`/login/reset?error=${encodeURIComponent('Passwords do not match.')}`)
  }

  if (password.length < 8) {
    redirect(`/login/reset?error=${encodeURIComponent('Password must be at least 8 characters long.')}`)
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      logTechnicalError('updatePassword', error)
      const userMessage = mapErrorMessage(error, 'Unable to update password. Please try again.')
      redirect(`/login/reset?error=${encodeURIComponent(userMessage)}`)
    }
  } catch (err: any) {
    if (err?.digest?.includes('NEXT_REDIRECT')) {
      throw err
    }
    logTechnicalError('updatePassword.unexpected', err)
    redirect(`/login/reset?error=${encodeURIComponent('Unable to update password. Please try again.')}`)
  }

  redirect('/login?resetSuccess=true')
}
