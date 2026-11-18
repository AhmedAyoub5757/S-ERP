export interface TeacherRow {
  id: string
  employee_number: string
  qualification: string | null
  joining_date: string
  profiles: { full_name: string; email: string; phone: string | null; status: string } | null
}