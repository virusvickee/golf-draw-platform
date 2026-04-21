import { Outlet, Link, useLocation, Navigate } from "react-router-dom"
import { Users, LayoutDashboard, Shuffle, HandHeart, Trophy, BarChart3, LogOut } from "lucide-react"
import { Button } from "../ui/button"
import { useAuthStore } from "../../store/authStore"

export function AdminLayout() {
  const { user, profile, loading } = useAuthStore()
  const { signOut } = useAuthStore()
  const location = useLocation()

  // Ensure gating runs avoiding flicker
  // Wait if auth is loading OR if user exists but profile isn't loaded yet
  if (loading || (user && !profile)) return null
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />
  if (profile?.role !== "admin") return <Navigate to="/" replace />

  const navigation = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Draw Setup", href: "/admin/draws", icon: Shuffle },
    { name: "Charities", href: "/admin/charities", icon: HandHeart },
    { name: "Winners", href: "/admin/winners", icon: Trophy },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ]

  return (
    <div className="flex h-screen bg-[#080B14] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#0A0E1A] border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-[#00FF87]">
            GOLF<span className="text-white">ADMIN</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                            (item.href !== "/admin" && location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium ${
                  isActive 
                    ? "bg-[#00FF87]/10 text-[#00FF87]" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Exit Admin
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-[#080B14]">
        <header className="h-16 border-b border-white/10 bg-[#0A0E1A]/50 backdrop-blur sticky top-0 z-10 px-8 flex items-center justify-between">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#FFD700] bg-[#FFD700]/10 px-3 py-1 rounded-full border border-[#FFD700]/20 hidden sm:inline-flex">
              Logged in as Admin
            </span>
            <Link to="/dashboard">
               <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-slate-300">
                  User View
               </Button>
            </Link>
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
