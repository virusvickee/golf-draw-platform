import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import type { Charity } from "../types"
import { Search, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const { data, error } = await supabase
          .from("charities")
          .select("*")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
        if (error) throw error
        setCharities(data || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Failed to load charities.")
      } finally {
        setLoading(false)
      }
    }
    fetchCharities()
  }, [])

  const filteredCharities = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black mb-6 text-white">Our Beneficiaries</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Every subscription powers the good work happening at these registered charities. Discover who you can support.
        </p>
      </div>

      <div className="relative max-w-xl mx-auto mb-12">
        <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
        <Input 
          className="pl-12 h-12 bg-[#0A0E1A] border-white/10 text-white rounded-full text-base focus-visible:ring-[#00FF87]"
          placeholder="Search charities by name..."
          aria-label="Search charities by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center mb-8">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-[300px] rounded-2xl bg-[#0A0E1A] border border-white/5 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharities.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">No charities matched your search.</div>
          )}
          {filteredCharities.map(charity => (
            <div key={charity.id} className={`flex flex-col bg-[#0A0E1A] border rounded-2xl overflow-hidden transition-transform hover:-translate-y-1 ${charity.is_featured ? 'border-[#FFD700]/30 shadow-[0_0_20px_rgba(255,215,0,0.1)]' : 'border-white/10'}`}>
              <div className="h-48 bg-[#080B14] relative flex items-center justify-center overflow-hidden">
                {charity.is_featured && (
                  <div className="absolute top-4 right-4 bg-[#FFD700] text-black text-xs font-bold px-3 py-1 rounded-full z-10">
                    Featured
                  </div>
                )}
                {charity.image_url ? (
                  <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="text-slate-700 font-bold tracking-widest uppercase">GOLF DRAW</div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 text-white">{charity.name}</h3>
                <p className="text-slate-400 text-sm mb-6 flex-1">{charity.description}</p>
                <div className="space-y-3">
                  {charity.website_url && (
                    <a href={charity.website_url} target="_blank" rel="noreferrer" className="flex items-center text-xs text-[#00FF87] hover:underline">
                      Visit Website <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                  <Button 
                    disabled
                    className="w-full bg-white/50 text-black cursor-not-allowed"
                    onClick={() => {
                      toast("Donation feature coming soon!", { 
                        description: "One-time donations will be available in the next phase." 
                      });
                    }}
                  >
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
