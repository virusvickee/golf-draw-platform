import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuthStore } from "../store/authStore"
import { useSubscriptionGuard } from "../hooks/useSubscriptionGuard"
import { Button } from "../components/ui/button"
import { Slider } from "../components/ui/slider"
import { toast } from "sonner"
import type { Charity } from "../types"

export default function SelectCharityPage() {
  // Must be logged in
  const { profile } = useSubscriptionGuard()
  const { fetchUser } = useAuthStore()
  const navigate = useNavigate()

  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null)
  const [contributionPercent, setContributionPercent] = useState<number>(10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadCharities = async () => {
      // Setup some dummy charities if DB is empty for UI testing
      const dummyCharities: Charity[] = [
        { id: "1", name: "Golf Fore Good", description: "Youth mentorship through golf", is_active: true, is_featured: false, created_at: "", image_url: "", website_url: "" },
        { id: "2", name: "Watering the Greens", description: "Clean water solutions", is_active: true, is_featured: true, created_at: "", image_url: "", website_url: "" }
      ]

      try {
        const { data, error } = await supabase.from("charities").select("*").eq("is_active", true)
        if (error) throw error
        setCharities(data && data.length > 0 ? data : dummyCharities)

        // Pre-select if resuming
        if (profile?.selected_charity_id) {
          setSelectedCharityId(profile.selected_charity_id)
        }
        if (profile?.charity_contribution_percent) {
          setContributionPercent(profile.charity_contribution_percent)
        }
      } catch (err) {
        console.error("Error loading charities:", err)
        setCharities(dummyCharities) // fallback
      } finally {
        setLoading(false)
      }
    }

    if (profile) loadCharities()
  }, [profile])

  const handleSave = async () => {
    if (!selectedCharityId) {
      toast.error("Please select a charity")
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          selected_charity_id: selectedCharityId,
          charity_contribution_percent: contributionPercent
        })
        .eq("id", profile?.id)

      if (error) throw error

      await fetchUser() // sync local store
      toast.success("Charity preferences saved!")
      
      // Proceed to subscribe
      navigate("/subscribe")
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#080B14]">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-white">Choose Your Impact</h1>
        <p className="text-slate-400 text-lg">Select the charity you want to support with your monthly subscription.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {charities.map((charity) => (
          <div 
            key={charity.id}
            onClick={() => setSelectedCharityId(charity.id)}
            className={`p-6 rounded-2xl border cursor-pointer transition-all ${
              selectedCharityId === charity.id 
                ? "bg-[#0A0E1A] border-[#00FF87] shadow-[0_0_15px_rgba(0,255,135,0.2)]" 
                : "bg-[#080B14] border-white/10 hover:border-white/30"
            }`}
          >
            <h3 className="text-xl font-bold text-white mb-2">{charity.name}</h3>
            <p className="text-slate-400 text-sm">{charity.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0A0E1A] p-8 rounded-2xl border border-white/10 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white">Your Contribution</h2>
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-4">
            <span className="text-slate-300">Amount to Charity</span>
            <span className="text-[#00FF87] font-bold text-lg">{Math.round(contributionPercent)}%</span>
          </div>
          <Slider 
            defaultValue={[contributionPercent]}
            max={50}
            min={10}
            step={5}
            onValueChange={(vals: number | readonly number[]) => {
              const val = Array.isArray(vals) ? vals[0] : (vals as number);
              setContributionPercent(val);
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Min (10%)</span>
            <span>Max (50%)</span>
          </div>
        </div>
        <p className="text-sm text-slate-400 bg-[#080B14] p-4 rounded-lg">
          The remaining percentage contributes to the overall prize pool and platform fees.
          Your choice makes a direct impact every month.
        </p>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving || !selectedCharityId}
          size="lg"
          className="bg-[#00FF87] text-[#080B14] hover:bg-[#00FF87]/90 font-bold px-12"
        >
          {saving ? "Saving..." : "Continue to Subscription"}
        </Button>
      </div>
    </div>
  )
}
