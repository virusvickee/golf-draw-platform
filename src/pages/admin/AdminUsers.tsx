import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { format, parseISO } from "date-fns"
import { Button } from "../../components/ui/button"

type AdminUserRow = {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
  subscription: {
    plan: string
    status: string
  } | null
  scores_count: number
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // For Admin use we might normally use a secure DB function or RPC if joining a lot.
      // We will do a basic query since this is client side.
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        
      if (profilesError) throw profilesError

      const { data: subsData } = await supabase.from("subscriptions").select("*")
      const { data: scoresData } = await supabase.from("scores").select("user_id")

      const aggregated: AdminUserRow[] = (profilesData || []).map(p => {
        const sub = (subsData || []).find(s => s.user_id === p.id)
        const scoreCount = (scoresData || []).filter(s => s.user_id === p.id).length
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          role: p.role,
          created_at: p.created_at,
          subscription: sub ? { plan: sub.plan, status: sub.status } : null,
          scores_count: scoreCount
        }
      })

      setUsers(aggregated)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-slate-400 mt-1">View and manage platform subscribers</p>
        </div>
      </div>

      <div className="bg-[#0A0E1A] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading users...</div>
        ) : (
          <Table>
            <TableHeader className="bg-[#080B14]">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Email</TableHead>
                <TableHead className="text-slate-400">Plan</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Scores</TableHead>
                <TableHead className="text-slate-400">Joined</TableHead>
                <TableHead className="text-right text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell className="text-slate-300">{u.email}</TableCell>
                  <TableCell>
                    {u.subscription ? (
                      <span className="capitalize">{u.subscription.plan}</span>
                    ) : (
                      <span className="text-slate-600">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.subscription ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        u.subscription.status === 'active' ? 'bg-[#00FF87]/20 text-[#00FF87]' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {u.subscription.status.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">{u.scores_count}/5</span>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {format(parseISO(u.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(u)} className="hover:text-[#00FF87]">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0E1A] border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-6">User Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="p-4 bg-[#080B14] rounded-lg border border-white/5">
                <div className="text-slate-500 mb-1">Full Name</div>
                <div className="font-bold">{selectedUser.full_name}</div>
              </div>
              <div className="p-4 bg-[#080B14] rounded-lg border border-white/5">
                <div className="text-slate-500 mb-1">Email address</div>
                <div className="font-bold">{selectedUser.email}</div>
              </div>
              <div className="p-4 bg-[#080B14] rounded-lg border border-white/5">
                <div className="text-slate-500 mb-1">Subscription</div>
                <div className="font-bold capitalize">{selectedUser.subscription?.plan || 'None'}</div>
              </div>
              <div className="p-4 bg-[#080B14] rounded-lg border border-white/5">
                <div className="text-slate-500 mb-1">Submitted Scores</div>
                <div className="font-bold font-mono">{selectedUser.scores_count}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" className="border-white/10" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
