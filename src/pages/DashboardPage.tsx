import { useEffect, useState } from "react"
import { useSubscriptionGuard } from "../hooks/useSubscriptionGuard"
import { supabase } from "../lib/supabase"
import { ScoreEntry } from "../components/scores/ScoreEntry"
import { ScoreHistory } from "../components/scores/ScoreHistory"
import { Link } from "react-router-dom"
import { Input } from "../components/ui/input"
import { toast } from "sonner"
import type { Score, Charity, Winner } from "../types"

export default function DashboardPage() {
  const { user, profile, subscription } = useSubscriptionGuard({ requireAuth: true, requireSubscription: true })
  
  const [scores, setScores] = useState<Score[]>([])
  const [charity, setCharity] = useState<Charity | null>(null)
  const [winner, setWinner] = useState<Winner | null>(null)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [loadingObj, setLoadingObj] = useState({ scores: true, charity: true, winner: true })

  const fetchScores = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.id)
        .order("score_date", { ascending: false })
      
      if (!error && data) {
        setScores(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingObj(prev => ({ ...prev, scores: false }))
    }
  }

  const fetchCharity = async () => {
    if (!profile?.selected_charity_id) {
      setLoadingObj(prev => ({ ...prev, charity: false }))
      return
    }
    try {
      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .eq("id", profile.selected_charity_id)
        .maybeSingle()
        
      if (!error && data) {
        setCharity(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingObj(prev => ({ ...prev, charity: false }))
    }
  }

  const fetchWinnerState = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from("winners")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        
      if (data) setWinner(data as Winner)
    } catch (err) {
      console.log("No winnings found or error", err)
    } finally {
      setLoadingObj(prev => ({ ...prev, winner: false }))
    }
  }

  useEffect(() => {
    if (user) {
      fetchScores()
      fetchCharity()
      fetchWinnerState()
    }
  }, [user, profile])

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !winner) return

    setUploadingProof(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${winner.id}-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('winner-proofs')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('winner-proofs').getPublicUrl(fileName)
      
      const { error: updateError } = await supabase
        .from("winners")
        .update({ proof_url: data.publicUrl })
        .eq("id", winner.id)

      if (updateError) throw updateError

      toast.success("Proof uploaded successfully! Awaiting verification.")
      fetchWinnerState()

    } catch (err: any) {
      toast.error(err.message || "Failed to upload proof")
    } finally {
      setUploadingProof(false)
    }
  }

  if (!user) return null

  const isEntered = scores.length === 5

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, {profile?.full_name || 'Golfer'}</h1>
          <p className="text-slate-400">Manage your scores, subscription, and view your impact.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Subscription Card */}
        <div className="p-6 rounded-2xl bg-[#0A0E1A] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Subscription</div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF87] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00FF87]"></span>
              </span>
              <span className="text-xl font-bold text-white capitalize">{subscription?.status || 'Active'}</span>
            </div>
            <div className="text-sm text-slate-400 capitalize">{subscription?.plan || 'Monthly'} Plan</div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <Link to="/settings" className="text-[#00FF87] text-sm hover:underline font-medium">Manage Billing →</Link>
          </div>
        </div>

        {/* Charity Card */}
        <div className="p-6 rounded-2xl bg-[#0A0E1A] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Your Charity</div>
            <div className="text-xl font-bold text-white mb-2 line-clamp-1">{charity?.name || 'Loading...'}</div>
            <div className="text-sm text-slate-400">
              Contribution: <span className="text-[#FFD700] font-bold">{profile?.charity_contribution_percent || 0}%</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <Link to="/select-charity" className="text-[#00FF87] text-sm hover:underline font-medium">Change preferences →</Link>
          </div>
        </div>

        {/* Winnings Overview */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FFD700]/10 to-[#0A0E1A] border border-[#FFD700]/30 flex flex-col justify-between">
          <div>
            <div className="text-sm font-bold text-[#FFD700] uppercase tracking-wider mb-2">Total Won</div>
            <div className="text-4xl font-black text-white font-mono">£{winner?.prize_amount || '0.00'}</div>
            {winner && (
              <div className="mt-4">
                <div className="text-xs text-slate-300 font-bold mb-1">
                  Status: 
                  <span className={`ml-1 capitalize ${
                    winner.payment_status === 'paid' ? 'text-[#00FF87]' :
                    winner.verification_status === 'approved' ? 'text-[#00FF87]' :
                    winner.verification_status === 'rejected' ? 'text-red-500' :
                    'text-[#FFD700]'
                  }`}>
                    {winner.payment_status === 'paid' ? 'Paid' : winner.verification_status}
                  </span>
                </div>
                
                {winner.verification_status === 'pending' && !winner.proof_url && (
                  <div className="mt-2">
                    <label className="text-xs text-slate-400 block mb-1">Upload Scorecard Proof</label>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleProofUpload} 
                      disabled={uploadingProof}
                      className="bg-black/50 text-xs border-[#FFD700]/30 h-8"
                    />
                  </div>
                )}
                {winner.proof_url && winner.verification_status === 'pending' && (
                  <div className="text-xs text-[#00BFFF] italic mt-1">Proof under review.</div>
                )}
              </div>
            )}
            {!winner && <div className="text-sm text-slate-400 mt-2">from 0 draws</div>}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <Link to="/winnings" className="text-[#FFD700] text-sm hover:underline font-medium">View Payment History →</Link>
          </div>
        </div>
      </div>

      {/* Draw Status */}
      <div className={`p-6 rounded-2xl border mb-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${isEntered ? 'bg-[#00FF87]/10 border-[#00FF87]' : 'bg-[#080B14] border-white/10'}`}>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            {isEntered ? "🎉 You're entered in the next draw!" : "Draw Participation Pending"}
          </h3>
          <p className={isEntered ? "text-[#00FF87]" : "text-slate-400"}>
            {isEntered 
              ? "Your 5 scores are locked in for the upcoming monthly draw. Good luck!" 
              : `You need ${5 - scores.length} more score(s) to enter the upcoming draw.`}
          </p>
        </div>
        <div className="bg-[#0A0E1A] py-2 px-6 rounded-full border border-white/10 font-mono text-white text-lg font-bold">
          {scores.length}/5 Scores
        </div>
      </div>

      {/* Scores Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <ScoreEntry scores={scores} onScoreUpdated={fetchScores} />
        </div>
        <div>
          {loadingObj.scores ? (
            <div className="h-48 flex items-center justify-center text-slate-500">Loading scores...</div>
          ) : (
            <ScoreHistory scores={scores} onScoreUpdated={fetchScores} />
          )}
        </div>
      </div>

    </div>
  )
}
