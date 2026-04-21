import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { toast } from "sonner"
import type { Score } from "../../types"
import { format, parseISO } from "date-fns"
import { Pencil, Trash2, X, Check } from "lucide-react"

interface ScoreHistoryProps {
  scores: Score[]
  onScoreUpdated: () => void
}

export function ScoreHistory({ scores, onScoreUpdated }: ScoreHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState("")
  const [editDate, setEditDate] = useState("")
  const [loading, setLoading] = useState(false)

  // Sort scores newest first (descending by score_date)
  const sortedScores = [...scores].sort(
    (a, b) => new Date(b.score_date).getTime() - new Date(a.score_date).getTime()
  )

  const handleEditClick = (score: Score) => {
    setEditingId(score.id)
    setEditScore(score.score.toString())
    setEditDate(score.score_date)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditScore("")
    setEditDate("")
  }

  const handleSaveEdit = async (id: string, originalDate: string) => {
    const numScore = parseInt(editScore, 10)
    if (isNaN(numScore) || numScore < 1 || numScore > 45) {
      toast.error("Score must be between 1 and 45")
      return
    }

    if (!editDate) {
      toast.error("Please select a date")
      return
    }

    // Check duplicate date but ignore if it's the SAME score being edited
    if (editDate !== originalDate) {
      const isDuplicate = scores.some(s => s.score_date === editDate && s.id !== id)
      if (isDuplicate) {
        toast.error("Another score already exists for this date.")
        return
      }
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from("scores")
        .update({ score: numScore, score_date: editDate })
        .eq("id", id)

      if (error) throw error
      
      toast.success("Score updated")
      setEditingId(null)
      onScoreUpdated()
    } catch (err: any) {
      toast.error(err.message || "Failed to update score")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this score?")) return
    
    setLoading(true)
    try {
      const { error } = await supabase.from("scores").delete().eq("id", id)
      if (error) throw error
      
      toast.success("Score deleted")
      onScoreUpdated()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete score")
    } finally {
      setLoading(false)
    }
  }

  if (scores.length === 0) {
    return (
      <div className="bg-[#0A0E1A] p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <div className="text-slate-400 mb-2">No scores submitted yet</div>
        <p className="text-sm text-slate-500">Add your first Stableford score to enter the draw!</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0A0E1A] p-6 rounded-2xl border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Your Recent Scores</h2>
        <span className="text-sm text-slate-400">{scores.length}/5 Submitted</span>
      </div>
      
      <div className="space-y-3">
        {sortedScores.map((score) => (
          <div key={score.id} className="p-4 rounded-xl bg-[#080B14] border border-white/5 flex items-center justify-between group hover:border-white/20 transition-colors">
            
            {editingId === score.id ? (
              <div className="flex-1 flex flex-col sm:flex-row gap-3 mr-4">
                <Input 
                  type="number" 
                  min="1" max="45" 
                  value={editScore} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditScore(e.target.value)} 
                  className="w-20 bg-black"
                />
                <Input 
                  type="date" 
                  value={editDate} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDate(e.target.value)} 
                  className="flex-1 bg-black text-white"
                />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-mono font-bold text-[#FFD700]">{score.score}</div>
                <div className="text-xs text-slate-400 font-medium">
                  {format(parseISO(score.score_date), 'MMM d, yyyy')}
                </div>
              </div>
            )}

            {editingId === score.id ? (
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="text-[#00FF87] hover:bg-[#00FF87]/10" onClick={() => handleSaveEdit(score.id, score.score_date)} disabled={loading}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-950" onClick={handleCancelEdit} disabled={loading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => handleEditClick(score)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-slate-400 hover:text-red-400" onClick={() => handleDelete(score.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
