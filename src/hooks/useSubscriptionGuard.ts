import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

interface GuardOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  requireSubscription?: boolean
}

export function useSubscriptionGuard(options: GuardOptions = { requireAuth: true }) {
  const { user, profile, subscription, loading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Wait until auth state finishes loading
    if (loading) return

    // 1. Require Auth Check
    if (options.requireAuth && !user) {
      navigate("/auth", { replace: true, state: { from: location.pathname } })
      return
    }

    // 2. Require Admin Check
    if (options.requireAdmin && profile?.role !== "admin") {
      navigate("/dashboard", { replace: true })
      return
    }

    // 3. Require Subscription Check
    if (options.requireSubscription) {
      if (!subscription || subscription.status !== "active") {
        // If not active, redirect to subscribe page
        navigate("/subscribe", { replace: true, state: { lapsed: subscription?.status === "lapsed" } })
        return
      }
    }
  }, [user, profile, subscription, loading, navigate, location, options])

  return { user, profile, subscription, loading }
}
