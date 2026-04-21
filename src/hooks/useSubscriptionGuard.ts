import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

interface GuardOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  requireSubscription?: boolean
}

export function useSubscriptionGuard(options?: GuardOptions) {
  const mergedOptions = { requireAuth: true, ...options }
  const { requireAuth, requireAdmin, requireSubscription } = mergedOptions
  const { user, profile, subscription, loading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Wait until auth state finishes loading
    if (loading) return

    // 1. Require Auth Check
    if (requireAuth && !user) {
      navigate("/auth", { replace: true, state: { from: location.pathname } })
      return
    }

    // 2. Require Admin Check
    if (requireAdmin && profile?.role !== "admin") {
      navigate("/dashboard", { replace: true })
      return
    }

    // 3. Require Subscription Check
    if (requireSubscription) {
      // Primary onboarding: Has user selected a charity?
      // Skip check for admins
      if (profile?.role === "subscriber" && !profile?.selected_charity_id) {
        if (location.pathname !== "/select-charity") {
          navigate("/select-charity", { replace: true })
          return
        }
      }

      if (!subscription || subscription.status !== "active") {
        // If not active, redirect to subscribe page
        if (location.pathname !== "/subscribe") {
          navigate("/subscribe", { replace: true, state: { lapsed: subscription?.status === "lapsed" } })
          return
        }
      }
    }
  }, [user, profile, subscription, loading, navigate, location.pathname, requireAuth, requireAdmin, requireSubscription])

  return { user, profile, subscription, loading }
}
