import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useAuthStore } from "../store/authStore"
import { format, parseISO } from "date-fns"
import type { Draw } from "../types"
import { checkMatch } from "../lib/drawEngine"

export default function DrawsPage() {
  const { user } = useAuthStore()
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [userScores, setUserScores] = useState<number[]>([])

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch Draws
      const { data: drawsData, error } = await supabase
        .from("draws")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      setDraws(drawsData || [])

      // Fetch User's current submitted scores context if logged in
      if (user) {
        const { data: scoresData } = await supabase
          .from("scores")
          .select("score")
          .eq("user_id", user.id)
        if (scoresData) {
          setUserScores(scoresData.map((s: any) => s.score as number))
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const userNumbers = userScores || []

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black mb-6 text-white">Draw Results</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Review historical drawn numbers and prize pool distributions. 
        </p>
      </div>

      <div className="space-y-8">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-[#0A0E1A] border border-white/5 rounded-2xl animate-pulse"></div>)
        ) : draws.length === 0 ? (
          <div className="text-center py-24 text-slate-500 bg-[#0A0E1A] rounded-2xl border border-white/5">
            No published draws available yet.
          </div>
        ) : (
          draws.map(draw => {
            const drawnNumbers = draw.drawn_numbers || []
            const matchCount = user ? checkMatch(drawnNumbers, userNumbers) : 0
            const isWinner = matchCount >= 3

            return (
              <div key={draw.id} className={`p-8 rounded-2xl border transition-all ${isWinner ? 'bg-[#0A0E1A] border-[#FFD700]/50 shadow-[0_0_30px_rgba(255,215,0,0.1)]' : 'bg-[#0A0E1A] border-white/10'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-white/5 gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {format(parseISO(draw.created_at), 'MMMM yyyy')} Draw
                    </h2>
                    <div className="flex gap-3">
                      <span className="text-sm bg-[#080B14] px-3 py-1 rounded-full text-slate-400">
                        Pool: <span className="text-white font-bold">£{Number(draw.total_pool).toFixed(2)}</span>
                      </span>
                      {draw.jackpot_rolled_over && (
                        <span className="text-sm bg-[#FFD700]/20 text-[#FFD700] px-3 py-1 rounded-full font-bold">
                          Jackpot Rolled Over!
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-2 md:text-right">Winning Numbers</div>
                    <div className="flex gap-2">
                       {drawnNumbers.map((num, i) => {
                         const match = userNumbers.includes(num)
                         return (
                           <div key={i} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-bold text-lg transition-all ${match ? 'bg-[#FFD700] border-[#FFD700] text-black scale-110 shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'bg-[#080B14] border-[#00FF87] text-[#00FF87]'}`}>
                             {num}
                           </div>
                         )
                       })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[#080B14] rounded-xl border border-white/5">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Jackpot (5 Match)</div>
                    <div className="text-2xl font-black text-[#FFD700]">£{Number(draw.jackpot_pool).toFixed(2)}</div>
                  </div>
                  <div className="text-center p-4 bg-[#080B14] rounded-xl border border-white/5">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">4 Matches</div>
                    <div className="text-xl font-bold text-white">£{Number(draw.second_pool).toFixed(2)}</div>
                  </div>
                  <div className="text-center p-4 bg-[#080B14] rounded-xl border border-white/5">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">3 Matches</div>
                    <div className="text-xl font-bold text-[#00FF87]">£{Number(draw.third_pool).toFixed(2)}</div>
                  </div>
                </div>

                {user && isWinner && (
                  <div className="mt-8 p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl text-center text-[#FFD700] font-bold">
                    🎉 Congratulations! You had {matchCount} winning numbers in this draw!
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
