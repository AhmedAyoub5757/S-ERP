import { createClient } from '@/lib/supabase/server'

export async function getCurrentUserRoles(): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id)

  if (error || !data) return []
  return data.map((row: any) => row.roles.name)
}