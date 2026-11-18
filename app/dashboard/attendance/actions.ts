'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { markAttendanceSchema } from '@/lib/validations/attendance'
import { revalidatePath } from 'next/cache'

export async function markAttendance(formData: FormData) {
  const roles = await getCurrentUserRoles()
  if (!roles.includes('school_admin') && !roles.includes('teacher')) {
    return { error: 'You do not have permission to mark attendance.' }
  }

  const sectionId = Number(formData.get('sectionId'))
  const date = formData.get('date') as string
  const recordsRaw = formData.get('records') as string

  let records
  try {
    records = JSON.parse(recordsRaw)
  } catch {
    return { error: 'Invalid attendance data.' }
  }

  const parsed = markAttendanceSchema.safeParse({ sectionId, date, records })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const rows = parsed.data.records.map((r) => ({
    student_id: r.studentId,
    section_id: parsed.data.sectionId,
    date: parsed.data.date,
    status: r.status,
    marked_by: user.id,
  }))

  const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'student_id,date' })

  if (error) {
    return { error: `Could not save attendance: ${error.message}` }
  }

  revalidatePath('/dashboard/attendance')
  return { success: true }
}