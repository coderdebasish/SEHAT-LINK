import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROLE_DASHBOARD_ROUTES } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const route = ROLE_DASHBOARD_ROUTES[profile.role] || '/login'
  redirect(route)
}
