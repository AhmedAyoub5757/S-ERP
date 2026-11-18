'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { announcementSchema } from '@/lib/validations/announcement'
import { revalidatePath } from 'next/cache'

export async function createAnnouncement(formData: FormData) {
  const roles = await getCurrentUserRoles()
  if (!roles.includes('school_admin') && !roles.includes('principal')) {
    return { error: 'You are not allowed to post announcements.' }
  }

  const targetClassIdRaw = formData.get('targetClassId')
  const targetSectionIdRaw = formData.get('targetSectionId')

  const parsed = announcementSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    audience: formData.get('audience'),
    targetClassId: targetClassIdRaw ? Number(targetClassIdRaw) : undefined,
    targetSectionId: targetSectionIdRaw ? Number(targetSectionIdRaw) : undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('announcements').insert({
    title: parsed.data.title,
    content: parsed.data.content,
    audience: parsed.data.audience,
    target_class_id: parsed.data.audience === 'specific_class' ? parsed.data.targetClassId : null,
    target_section_id: parsed.data.audience === 'specific_section' ? parsed.data.targetSectionId : null,
    created_by: user.id,
    published_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/announcements')
  return { success: true }
}