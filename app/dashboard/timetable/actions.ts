'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { timetableSlotSchema } from '@/lib/validations/timetable'
import { revalidatePath } from 'next/cache'

export async function createTimetableSlot(formData: FormData) {
  const roles = await getCurrentUserRoles()
  if (!roles.includes('school_admin')) {
    return { error: 'Only a school admin can manage the timetable.' }
  }

  const parsed = timetableSlotSchema.safeParse({
    sectionId: Number(formData.get('sectionId')),
    subjectId: Number(formData.get('subjectId')),
    teacherId: formData.get('teacherId'),
    dayOfWeek: Number(formData.get('dayOfWeek')),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: currentYear } = await supabase
    .from('academic_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (!currentYear) {
    return { error: 'No current academic year is set.' }
  }

  const { error } = await supabase.from('timetable_slots').insert({
    academic_year_id: currentYear.id,
    section_id: parsed.data.sectionId,
    subject_id: parsed.data.subjectId,
    teacher_id: parsed.data.teacherId,
    day_of_week: parsed.data.dayOfWeek,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
  })

  if (error) {
    // Likely a unique-constraint hit: the section or teacher is already booked at that day/time.
    return { error: `Could not add slot: ${error.message}` }
  }

  revalidatePath('/dashboard/timetable')
  return { success: true }
}