import { Navigate, useLocation, Outlet } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"

interface ProtectedRouteProps {
  requireSubscription?: boolean
}

export function ProtectedRoute({ requireSubscription }: ProtectedRouteProps) {
  const { user, subscription, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return null // App.tsx already shows global loader, but we can return null to avoid flicker
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />
  }

  if (requireSubscription && (!subscription || subscription.status !== "active")) {
    return <Navigate to="/subscribe" state={{ lapsed: subscription?.status === "lapsed" }} replace />
  }

  return <Outlet />
}
