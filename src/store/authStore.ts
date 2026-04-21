import { create } from "zustand"
import type { Profile, Subscription } from "../types"
import { supabase } from "../lib/supabase"

interface AuthState {
  user: any | null
  profile: Profile | null
  subscription: Subscription | null
  loading: boolean
  setUser: (user: any | null) => void
  setProfile: (profile: Profile | null) => void
  setSubscription: (sub: Subscription | null) => void
  fetchUser: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  subscription: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setSubscription: (subscription) => set({ subscription }),
  fetchUser: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({ user: session.user })
      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle()
      
      if (profile) set({ profile })

      // Fetch subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (sub) set({ subscription: sub })
    } else {
      set({ user: null, profile: null, subscription: null })
    }
    set({ loading: false })
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, subscription: null })
  }
}))
