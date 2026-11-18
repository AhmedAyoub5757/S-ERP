import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRoles } from '@/lib/auth/get-user-roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function MyChildrenPage() {
  const supabase = await createClient()
  const roles = await getCurrentUserRoles()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!roles.includes('parent')) redirect('/dashboard')

  const { data: links } = await supabase
    .from('parent_students')
    .select(`
      student_id,
      students (
        id,
        admission_number,
        status,
        profiles ( full_name ),
        sections ( name, classes ( name ) )
      )
    `)
    .eq('parent_id', user.id)

  const children = (links ?? []).map((l: any) => l.students).filter(Boolean)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Children</h1>
        <p className="text-muted-foreground">View your children&apos;s attendance, results, fees, and schedule.</p>
      </div>

      {children.length === 0 ? (
        <p className="text-muted-foreground">No children are linked to your account yet. Contact the school office.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child: any) => (
            <Link key={child.id} href={`/dashboard/students/${child.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">{child.profiles?.full_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Admission No: {child.admission_number}</p>
                  <p>{child.sections?.classes?.name} - {child.sections?.name}</p>
                  <Badge variant={child.status === 'active' ? 'default' : 'secondary'}>{child.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}