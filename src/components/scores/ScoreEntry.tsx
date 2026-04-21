import { useState } from "react"
import { useAuthStore } from "../../store/authStore"
import { supabase } from "../../lib/supabase"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { toast } from "sonner"
import type { Score } from "../../types"

interface ScoreEntryProps {
  scores: Score[]
  onScoreUpdated: () => void
}

export function ScoreEntry({ scores, onScoreUpdated }: ScoreEntryProps) {
  const { user } = useAuthStore()
  const [score, setScore] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const numScore = parseInt(score, 10)
    if (isNaN(numScore) || numScore < 1 || numScore > 45) {
      toast.error("Score must be between 1 and 45")
      return
    }

    if (!date) {
      toast.error("Please select a date")
      return
    }

    // 1. Check for duplicate date
    const isDuplicate = scores.some(s => s.score_date === date)
    if (isDuplicate) {
      toast.error("A score already exists for this date. Edit it instead.")
      return
    }

    setLoading(true)

    try {
      // 2. If already 5 scores, delete oldest before inserting
      if (scores.length >= 5) {
        // Sort ascending by score_date (oldest first)
        const sortedScores = [...scores].sort(
          (a, b) => new Date(a.score_date).getTime() - new Date(b.score_date).getTime()
        )
        const oldest = sortedScores[0]
        
        const { error: delError } = await supabase
          .from("scores")
          .delete()
          .eq("id", oldest.id)
          
        if (delError) throw delError
      }

      // 3. Insert new score
      const { error: insError } = await supabase
        .from("scores")
        .insert({
          user_id: user.id,
          score: numScore,
          score_date: date
        })

      if (insError) throw insError

      toast.success("Score added successfully!")
      setScore("")
      setDate("")
      onScoreUpdated()
      
    } catch (err: any) {
      toast.error(err.message || "Failed to add score")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0A0E1A] p-6 rounded-2xl border border-white/10">
      <h2 className="text-xl font-bold mb-4 text-[#00FF87]">Submit Score</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="score">Stableford Score (1-45)</Label>
          <Input
            id="score"
            type="number"
            min="1"
            max="45"
            value={score}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScore(e.target.value)}
            required
            className="bg-[#080B14] border-white/10"
            placeholder="e.g. 36"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date of Round</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
            required
            className="bg-[#080B14] border-white/10 text-white"
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#FFD700] hover:bg-white text-[#080B14] font-bold"
        >
          {loading ? "Saving..." : "Add Score"}
        </Button>
      </form>
    </div>
  )
}
