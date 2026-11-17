export interface StudentRow {
  id: string
  admission_number: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  status: 'active' | 'inactive' | 'graduated' | 'transferred'
  profiles: { full_name: string; email: string; phone: string | null } | null
  sections: { name: string; classes: { name: string } | null } | null
}