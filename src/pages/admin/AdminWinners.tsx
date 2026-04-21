import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { toast } from "sonner"
import type { Winner } from "../../types"

export default function AdminWinners() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("winners").select("*, profiles(full_name, email)").order("created_at", { ascending: false })
      if (error) throw error
      setWinners(data as any || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, field: 'verification_status' | 'payment_status', value: string) => {
    try {
      const { error } = await supabase.from("winners").update({ [field]: value }).eq("id", id)
      if (error) throw error
      toast.success("Status updated")
      fetchWinners()
    } catch (err: any) {
      toast.error(err.message || "Failed update")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Winner Verification</h1>
          <p className="text-slate-400 mt-1">Review proofs, approve winnings, and track payouts.</p>
        </div>
      </div>

      <div className="bg-[#0A0E1A] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading winners...</div>
        ) : (
          <Table>
            <TableHeader className="bg-[#080B14]">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400">Match</TableHead>
                <TableHead className="text-slate-400">Prize Amount</TableHead>
                <TableHead className="text-slate-400">Verification</TableHead>
                <TableHead className="text-slate-400">Proof</TableHead>
                <TableHead className="text-right text-slate-400">Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center p-8 text-slate-500">No winners found</TableCell>
                 </TableRow>
              )}
              {winners.map((w: any) => (
                <TableRow key={w.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium">
                    {w.profiles?.full_name}
                    <div className="text-xs text-slate-500 font-normal">{w.profiles?.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[#00FF87]">{w.match_type}</span>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-[#FFD700]">
                    £{Number(w.prize_amount).toFixed(2)}
                  </TableCell>
                  
                  {/* Verification Status */}
                  <TableCell>
                    {w.verification_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-[#00FF87]/20 text-[#00FF87] hover:bg-[#00FF87]/30 h-7" onClick={() => updateStatus(w.id, 'verification_status', 'approved')}>Approve</Button>
                        <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 h-7" onClick={() => updateStatus(w.id, 'verification_status', 'rejected')}>Reject</Button>
                      </div>
                    )}
                    {w.verification_status === 'approved' && <span className="text-[#00FF87] font-bold text-sm">Approved</span>}
                    {w.verification_status === 'rejected' && <span className="text-red-500 font-bold text-sm">Rejected</span>}
                  </TableCell>
                  
                  <TableCell>
                    {w.proof_url ? (
                      <a href={w.proof_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm truncate max-w-[100px] block">
                        View Image
                      </a>
                    ) : (
                      <span className="text-slate-500 text-sm">Awaiting Upload</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right">
                     {w.payment_status === 'paid' ? (
                       <span className="text-slate-500 text-sm font-bold">Paid</span>
                     ) : (
                       <Button 
                        size="sm" 
                        variant="outline"
                        className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black"
                        onClick={() => updateStatus(w.id, 'payment_status', 'paid')}
                        disabled={w.verification_status !== 'approved'}
                       >
                         Mark Paid
                       </Button>
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
