import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase env vars. Check .env.local')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_PASSWORD = 'Password123!'

async function getRoleId(name: string): Promise<number> {
  const { data, error } = await supabase.from('roles').select('id').eq('name', name).single()
  if (error || !data) throw new Error(`Role not found: ${name}`)
  return data.id
}

async function createPerson(email: string, fullName: string, phone: string, roleName: string, roleId: number) {
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
  })
  if (userError || !userData.user) throw new Error(`Failed creating auth user ${email}: ${userError?.message}`)

  const userId = userData.user.id

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    full_name: fullName,
    email,
    phone,
  })
  if (profileError) throw new Error(`Failed creating profile for ${email}: ${profileError.message}`)

  const { error: roleError } = await supabase.from('user_roles').insert({
    user_id: userId,
    role_id: roleId,
  })
  if (roleError) throw new Error(`Failed assigning role for ${email}: ${roleError.message}`)

  console.log(`  created ${roleName}: ${email}`)
  return userId
}

async function main() {
  console.log('Seeding database...')

  // ---------- Role IDs ----------
  const schoolAdminRoleId = await getRoleId('school_admin')
  const principalRoleId = await getRoleId('principal')
  const teacherRoleId = await getRoleId('teacher')
  const accountantRoleId = await getRoleId('accountant')
  const receptionistRoleId = await getRoleId('receptionist')
  const studentRoleId = await getRoleId('student')
  const parentRoleId = await getRoleId('parent')

  // ---------- Academic Year ----------
  console.log('Creating academic year...')
  const { data: ay, error: ayError } = await supabase
    .from('academic_years')
    .insert({ name: '2026-2027', start_date: '2026-08-01', end_date: '2027-06-30', is_current: true })
    .select()
    .single()
  if (ayError || !ay) throw new Error(`Academic year failed: ${ayError?.message}`)
  const academicYearId = ay.id

  // ---------- Staff: Admin, Principal, Accountant, Receptionist ----------
  console.log('Creating staff accounts...')
  const adminId = await createPerson('admin@school.test', 'Ayesha Khan', faker.phone.number(), 'school_admin', schoolAdminRoleId)
  await createPerson('principal@school.test', faker.person.fullName(), faker.phone.number(), 'principal', principalRoleId)
  const accountantId = await createPerson('accountant@school.test', faker.person.fullName(), faker.phone.number(), 'accountant', accountantRoleId)
  await createPerson('receptionist@school.test', faker.person.fullName(), faker.phone.number(), 'receptionist', receptionistRoleId)

  // ---------- Teachers (15) ----------
  console.log('Creating teachers...')
  const teacherIds: string[] = []
  for (let i = 1; i <= 15; i++) {
    const fullName = faker.person.fullName()
    const email = `teacher${i}@school.test`
    const teacherId = await createPerson(email, fullName, faker.phone.number(), 'teacher', teacherRoleId)
    const { error } = await supabase.from('teachers').insert({
      id: teacherId,
      employee_number: `EMP-${1000 + i}`,
      qualification: faker.helpers.arrayElement(['B.Ed', 'M.Ed', 'MSc', 'MA', 'PhD']),
      joining_date: faker.date.past({ years: 5 }).toISOString().split('T')[0],
    })
    if (error) throw new Error(`teacher row failed: ${error.message}`)
    teacherIds.push(teacherId)
  }

  // ---------- Classes & Sections ----------
  console.log('Creating classes and sections...')
  const classIds: number[] = []
  for (let g = 1; g <= 8; g++) {
    const { data: cls, error } = await supabase
      .from('classes')
      .insert({ academic_year_id: academicYearId, name: `Grade ${g}` })
      .select()
      .single()
    if (error || !cls) throw new Error(`class failed: ${error?.message}`)
    classIds.push(cls.id)
  }

  const sectionIds: number[] = []
  const sectionClassTeacher = new Map<number, string>()
  let teacherCursor = 0
  for (const classId of classIds) {
    for (const sectionName of ['A', 'B']) {
      const classTeacherId = teacherIds[teacherCursor % teacherIds.length]
      teacherCursor++
      const { data: sec, error } = await supabase
        .from('sections')
        .insert({ class_id: classId, name: sectionName, capacity: 30, class_teacher_id: classTeacherId })
        .select()
        .single()
      if (error || !sec) throw new Error(`section failed: ${error?.message}`)
      sectionIds.push(sec.id)
      sectionClassTeacher.set(sec.id, classTeacherId)
    }
  }

  // ---------- Subjects ----------
  console.log('Creating subjects...')
  const subjectNames = ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Art', 'Physical Education', 'Urdu']
  const subjectIds: number[] = []
  for (const name of subjectNames) {
    const code = name.slice(0, 3).toUpperCase()
    const { data: subj, error } = await supabase
      .from('subjects')
      .insert({ name, code })
      .select()
      .single()
    if (error || !subj) throw new Error(`subject failed: ${error?.message}`)
    subjectIds.push(subj.id)
  }

  // ---------- Class-Subjects ----------
  console.log('Linking subjects to classes...')
  const sectionToClass = new Map<number, number>()
  {
    let idx = 0
    for (const classId of classIds) {
      sectionToClass.set(sectionIds[idx], classId); idx++
      sectionToClass.set(sectionIds[idx], classId); idx++
    }
  }
  for (const classId of classIds) {
    for (const subjectId of subjectIds) {
      const { error } = await supabase.from('class_subjects').insert({ class_id: classId, subject_id: subjectId })
      if (error) throw new Error(`class_subjects failed: ${error.message}`)
    }
  }

  // ---------- Teacher Assignments ----------
  console.log('Assigning teachers to sections/subjects...')
  const assignmentMap = new Map<string, string>()
  let assignCursor = 0
  for (const sectionId of sectionIds) {
    for (const subjectId of subjectIds) {
      const teacherId = teacherIds[assignCursor % teacherIds.length]
      assignCursor++
      const { error } = await supabase.from('teacher_assignments').insert({
        teacher_id: teacherId,
        subject_id: subjectId,
        section_id: sectionId,
        academic_year_id: academicYearId,
      })
      if (error) throw new Error(`teacher_assignments failed: ${error.message}`)
      assignmentMap.set(`${subjectId}-${sectionId}`, teacherId)
    }
  }

  // ---------- Students ----------
  console.log('Creating students...')
  const students: { id: string; sectionId: number; classId: number }[] = []
  let admissionCounter = 1001
  for (const sectionId of sectionIds) {
    for (let i = 0; i < 6; i++) {
      const gender = faker.helpers.arrayElement(['male', 'female']) as 'male' | 'female'
      const fullName = faker.person.fullName({ sex: gender })
      const email = `student${admissionCounter}@school.test`
      const studentId = await createPerson(email, fullName, faker.phone.number(), 'student', studentRoleId)
      const { error } = await supabase.from('students').insert({
        id: studentId,
        admission_number: `ADM-${admissionCounter}`,
        section_id: sectionId,
        admission_date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
        date_of_birth: faker.date.birthdate({ min: 6, max: 16, mode: 'age' }).toISOString().split('T')[0],
        gender,
        blood_group: faker.helpers.arrayElement(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-']),
        address: faker.location.streetAddress(),
        status: 'active',
      })
      if (error) throw new Error(`student row failed: ${error.message}`)
      students.push({ id: studentId, sectionId, classId: sectionToClass.get(sectionId)! })
      admissionCounter++
    }
  }

  // ---------- Parents (with sibling grouping ~15% of the time) ----------
  console.log('Creating parents...')
  let lastParentId: string | null = null
  let siblingUsed = false
  for (const student of students) {
    let parentId: string
    if (lastParentId && !siblingUsed && Math.random() < 0.15) {
      parentId = lastParentId
      siblingUsed = true
    } else {
      const fullName = faker.person.fullName()
      const email = `parent.${faker.string.alphanumeric(8)}@school.test`
      parentId = await createPerson(email, fullName, faker.phone.number(), 'parent', parentRoleId)
      const { error } = await supabase.from('parents').insert({
        id: parentId,
        occupation: faker.person.jobTitle(),
      })
      if (error) throw new Error(`parent row failed: ${error.message}`)
      lastParentId = parentId
      siblingUsed = false
    }

    const { error } = await supabase.from('parent_students').insert({
      parent_id: parentId,
      student_id: student.id,
      relationship: faker.helpers.arrayElement(['father', 'mother', 'guardian']),
    })
    if (error) throw new Error(`parent_students failed: ${error.message}`)
  }

  // ---------- Admission Applications ----------
  console.log('Creating admission applications...')
  for (let i = 0; i < 10; i++) {
    const gender = faker.helpers.arrayElement(['male', 'female']) as 'male' | 'female'
    const { error } = await supabase.from('admission_applications').insert({
      applicant_name: faker.person.fullName({ sex: gender }),
      date_of_birth: faker.date.birthdate({ min: 5, max: 15, mode: 'age' }).toISOString().split('T')[0],
      gender,
      guardian_name: faker.person.fullName(),
      guardian_phone: faker.phone.number(),
      guardian_email: faker.internet.email(),
      applying_for_class_id: faker.helpers.arrayElement(classIds),
      status: faker.helpers.arrayElement(['pending', 'pending', 'approved', 'rejected']),
    })
    if (error) throw new Error(`admission_applications failed: ${error.message}`)
  }

  // ---------- Attendance (last 20 weekdays) ----------
  console.log('Creating attendance records...')
  const attendanceDates: string[] = []
  {
    const d = new Date()
    let count = 0
    while (count < 20) {
      d.setDate(d.getDate() - 1)
      const day = d.getDay()
      if (day !== 0 && day !== 6) {
        attendanceDates.push(d.toISOString().split('T')[0])
        count++
      }
    }
  }

  for (const student of students) {
    const markedBy = sectionClassTeacher.get(student.sectionId)!
    const rows = attendanceDates.map((date) => ({
      student_id: student.id,
      section_id: student.sectionId,
      date,
      status: faker.helpers.weightedArrayElement([
        { value: 'present', weight: 90 },
        { value: 'absent', weight: 5 },
        { value: 'late', weight: 3 },
        { value: 'excused', weight: 2 },
      ]),
      marked_by: markedBy,
    }))
    const { error } = await supabase.from('attendance').insert(rows)
    if (error) throw new Error(`attendance failed: ${error.message}`)
  }

  // ---------- Examinations ----------
  console.log('Creating examination and exam subjects...')
  const { data: exam, error: examError } = await supabase
    .from('examinations')
    .insert({
      academic_year_id: academicYearId,
      name: 'Mid-Term Examination 2026',
      start_date: '2026-11-02',
      end_date: '2026-11-10',
    })
    .select()
    .single()
  if (examError || !exam) throw new Error(`examination failed: ${examError?.message}`)

  const examSubjectMap = new Map<string, number>()
  let examDay = 2
  for (const classId of classIds) {
    for (const subjectId of subjectIds) {
      const { data: es, error } = await supabase
        .from('exam_subjects')
        .insert({
          examination_id: exam.id,
          subject_id: subjectId,
          class_id: classId,
          exam_date: `2026-11-${String(examDay).padStart(2, '0')}`,
          max_marks: 100,
          passing_marks: 40,
        })
        .select()
        .single()
      if (error || !es) throw new Error(`exam_subjects failed: ${error?.message}`)
      examSubjectMap.set(`${classId}-${subjectId}`, es.id)
      examDay = examDay >= 10 ? 2 : examDay + 1
    }
  }

  // ---------- Marks ----------
  console.log('Creating marks...')
  for (const student of students) {
    for (const subjectId of subjectIds) {
      const examSubjectId = examSubjectMap.get(`${student.classId}-${subjectId}`)!
      const teacherId = assignmentMap.get(`${subjectId}-${student.sectionId}`)!
      const { error } = await supabase.from('marks').insert({
        exam_subject_id: examSubjectId,
        student_id: student.id,
        marks_obtained: faker.number.int({ min: 35, max: 98 }),
        entered_by: teacherId,
      })
      if (error) throw new Error(`marks failed: ${error.message}`)
    }
  }

  // ---------- Fee Structures ----------
  console.log('Creating fee structures...')
  const feeStructureMap = new Map<number, { id: number; amount: number }>()
  let gradeIdx = 1
  for (const classId of classIds) {
    const amount = 5000 + gradeIdx * 500
    const { data: fs, error } = await supabase
      .from('fee_structures')
      .insert({
        academic_year_id: academicYearId,
        class_id: classId,
        name: 'Tuition Fee - Term 1',
        amount,
        frequency: 'term',
      })
      .select()
      .single()
    if (error || !fs) throw new Error(`fee_structures failed: ${error?.message}`)
    feeStructureMap.set(classId, { id: fs.id, amount })
    gradeIdx++
  }

  // ---------- Invoices, Invoice Items, Payments ----------
  console.log('Creating invoices and payments...')
  let invoiceCounter = 1
  for (const student of students) {
    const fee = feeStructureMap.get(student.classId)!
    const invoiceNumber = `INV-2026-${String(invoiceCounter).padStart(4, '0')}`
    invoiceCounter++

    const paymentState = faker.helpers.arrayElement(['paid', 'partially_paid', 'unpaid', 'unpaid', 'overdue'])
    const dueDate = paymentState === 'overdue' ? '2026-10-01' : '2026-12-15'

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .insert({
        student_id: student.id,
        invoice_number: invoiceNumber,
        issue_date: '2026-09-01',
        due_date: dueDate,
        total_amount: fee.amount,
        status: paymentState,
        created_by: accountantId,
      })
      .select()
      .single()
    if (invError || !invoice) throw new Error(`invoice failed: ${invError?.message}`)

    const { error: itemError } = await supabase.from('invoice_items').insert({
      invoice_id: invoice.id,
      fee_structure_id: fee.id,
      description: 'Tuition Fee - Term 1',
      amount: fee.amount,
    })
    if (itemError) throw new Error(`invoice_items failed: ${itemError.message}`)

    if (paymentState === 'paid' || paymentState === 'partially_paid') {
      const amountPaid = paymentState === 'paid' ? fee.amount : Math.round(fee.amount * 0.5)
      const { error: payError } = await supabase.from('payments').insert({
        invoice_id: invoice.id,
        amount: amountPaid,
        payment_date: '2026-09-15',
        payment_method: faker.helpers.arrayElement(['cash', 'bank_transfer', 'card', 'online']),
        received_by: accountantId,
      })
      if (payError) throw new Error(`payments failed: ${payError.message}`)
    }
  }

  // ---------- Timetable ----------
  console.log('Creating timetable...')
  const periodTimes = [
    ['08:00', '08:45'],
    ['08:45', '09:30'],
    ['09:30', '10:15'],
    ['10:30', '11:15'],
    ['11:15', '12:00'],
    ['12:00', '12:45'],
  ]
  const teacherSlotUsed = new Set<string>()
  for (const sectionId of sectionIds) {
    for (let day = 1; day <= 5; day++) {
      for (let p = 0; p < periodTimes.length; p++) {
        const subjectId = subjectIds[(p + sectionId) % subjectIds.length]
        const teacherId = assignmentMap.get(`${subjectId}-${sectionId}`)
        if (!teacherId) continue
        const key = `${teacherId}-${day}-${periodTimes[p][0]}`
        if (teacherSlotUsed.has(key)) continue
        teacherSlotUsed.add(key)
        const { error } = await supabase.from('timetable_slots').insert({
          academic_year_id: academicYearId,
          section_id: sectionId,
          subject_id: subjectId,
          teacher_id: teacherId,
          day_of_week: day,
          start_time: periodTimes[p][0],
          end_time: periodTimes[p][1],
        })
        if (error) throw new Error(`timetable_slots failed: ${error.message}`)
      }
    }
  }

  // ---------- Announcements ----------
  console.log('Creating announcements...')
  const announcementTitles = [
    'Mid-Term Examination Schedule Released',
    'Parent-Teacher Meeting This Friday',
    'Annual Sports Day Announcement',
    'Winter Break Schedule',
    'New Library Hours',
    'School Uniform Policy Reminder',
  ]
  for (const title of announcementTitles) {
    const { error } = await supabase.from('announcements').insert({
      title,
      content: faker.lorem.paragraph(),
      created_by: adminId,
      audience: 'all',
    })
    if (error) throw new Error(`announcements failed: ${error.message}`)
  }

  // ---------- School Settings ----------
  console.log('Creating school settings...')
  const { error: settingsError } = await supabase.from('school_settings').insert({
    id: 1,
    school_name: 'Greenwood International School',
    address: '123 Education Lane, Demo City',
    phone: '+1-555-0100',
    email: 'info@greenwood.test',
    current_academic_year_id: academicYearId,
  })
  if (settingsError) throw new Error(`school_settings failed: ${settingsError.message}`)

  console.log('Seeding complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})