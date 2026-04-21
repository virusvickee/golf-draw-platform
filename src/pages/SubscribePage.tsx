import { useState } from "react"
import { useAuthStore } from "../store/authStore"
import { useSubscriptionGuard } from "../hooks/useSubscriptionGuard"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Check } from "lucide-react"

export default function SubscribePage() {
  const { user } = useSubscriptionGuard({ requireAuth: true })
  const { fetchUser } = useAuthStore()
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const plans = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: "£9.99",
      interval: "month",
      features: ["Enter 1 monthly draw", "Support your chosen charity", "Access to algorithmic dashboard"]
    },
    {
      id: "yearly",
      name: "Yearly Plan",
      price: "£99.99",
      interval: "year",
      features: ["Enter 12 monthly draws", "Save 16% annually", "Priority charity events access"]
    }
  ]

  const handleSubscribe = async (planId: string) => {
    if (!user) return
    setLoadingPlan(planId)

    try {
      // For demo purposes (as webhooks aren't available), we directly insert/update the DB.
      // In production, this creates a Stripe Checkout Session via an Edge Function/Backend.
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (existingSub) {
        // Update existing
        const { error } = await supabase.from("subscriptions").update({
          plan: planId,
          status: 'active',
          amount_paid: planId === 'yearly' ? 99.99 : 9.99,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(new Date().setMonth(new Date().getMonth() + (planId === 'yearly' ? 12 : 1))).toISOString()
        }).eq('id', existingSub.id)
        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase.from("subscriptions").insert({
          user_id: user.id,
          plan: planId,
          status: 'active',
          amount_paid: planId === 'yearly' ? 99.99 : 9.99,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(new Date().setMonth(new Date().getMonth() + (planId === 'yearly' ? 12 : 1))).toISOString()
        })
        if (error) throw error
      }

      await fetchUser() // Update global layout context
      toast.success(`Successfully subscribed to ${planId} plan!`)
      navigate("/dashboard")

    } catch (err: any) {
      toast.error(err.message || "Failed to process subscription")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black mb-4">Choose Your Subscription</h1>
        <p className="text-slate-400 text-lg">
          Secure your entry into the monthly draws and start supporting your charity today.
        </p>
        <div className="mt-4 p-3 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg inline-block text-sm text-[#FFD700]">
          <b>Demo Note:</b> Use test card <b>4242 4242 4242 4242</b> if Stripe drops in. Currently simulating success natively.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative p-8 rounded-2xl border transition-all ${
              plan.id === 'yearly' 
                ? 'bg-gradient-to-br from-[#080B14] to-[#0A0E1A] border-[#00FF87] shadow-[0_0_30px_rgba(0,255,135,0.15)] scale-105 z-10 hidden md:block'
                : 'bg-[#0A0E1A] border-white/10'
            } md:flex flex-col ${plan.id === 'yearly' ? 'md:flex' : ''}`}
          >
            {plan.id === 'yearly' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00FF87] text-[#080B14] font-bold px-4 py-1 rounded-full text-sm">
                Most Popular
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-slate-400">/{plan.interval}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <Check className="h-5 w-5 text-[#00FF87]" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan !== null}
              className={`w-full py-4 rounded-xl font-bold transition-all ${
                plan.id === 'yearly'
                  ? 'bg-[#00FF87] text-[#080B14] hover:bg-[#00FF87]/80'
                  : 'bg-white text-black hover:bg-slate-200'
              }`}
            >
              {loadingPlan === plan.id ? "Processing..." : `Select ${plan.name}`}
            </button>
          </div>
        ))}

        {/* Display Yearly on Mobile correctly without hidden override */}
        <div key="yearly-mobile" className="md:hidden relative p-8 rounded-2xl border bg-gradient-to-br from-[#080B14] to-[#0A0E1A] border-[#00FF87] shadow-[0_0_30px_rgba(0,255,135,0.15)] flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00FF87] text-[#080B14] font-bold px-4 py-1 rounded-full text-sm">
              Most Popular
            </div>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Yearly Plan</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">£99.99</span>
                <span className="text-slate-400">/year</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-300"><Check className="h-5 w-5 text-[#00FF87]" />Enter 12 monthly draws</li>
                <li className="flex items-center gap-3 text-slate-300"><Check className="h-5 w-5 text-[#00FF87]" />Save 16% annually</li>
                <li className="flex items-center gap-3 text-slate-300"><Check className="h-5 w-5 text-[#00FF87]" />Priority charity events access</li>
            </ul>

            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loadingPlan !== null}
              className="w-full py-4 rounded-xl font-bold transition-all bg-[#00FF87] text-[#080B14] hover:bg-[#00FF87]/80"
            >
              {loadingPlan === 'yearly' ? "Processing..." : `Select Yearly Plan`}
            </button>
        </div>
      </div>
    </div>
  )
}
