import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import { useAuthStore } from "./store/authStore"
import { MainLayout } from "./components/layout/MainLayout"
import { AdminLayout } from "./components/layout/AdminLayout"
import { ProtectedRoute } from "./components/layout/ProtectedRoute"

// Pages
import HomePage from "./pages/HomePage"
import AuthPage from "./pages/AuthPage"
import DashboardPage from "./pages/DashboardPage"
import CharitiesPage from "./pages/CharitiesPage"
import SubscribePage from "./pages/SubscribePage"
import SelectCharityPage from "./pages/SelectCharityPage"
import DrawsPage from "./pages/DrawsPage"

// Admin Pages
import AdminAnalytics from "./pages/admin/AdminAnalytics"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminDraws from "./pages/admin/AdminDraws"
import AdminCharities from "./pages/admin/AdminCharities"
import AdminWinners from "./pages/admin/AdminWinners"

export default function App() {
  const { fetchUser, loading } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF87]"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Standard Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/charities" element={<CharitiesPage />} />
          <Route path="/draws" element={<DrawsPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/subscribe" element={<SubscribePage />} />
            <Route path="/select-charity" element={<SelectCharityPage />} />
          </Route>
          
          <Route element={<ProtectedRoute requireSubscription />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/draws" element={<AdminDraws />} />
          <Route path="/admin/charities" element={<AdminCharities />} />
          <Route path="/admin/winners" element={<AdminWinners />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
