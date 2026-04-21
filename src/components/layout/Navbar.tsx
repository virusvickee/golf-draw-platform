import { Link } from "react-router-dom"
import { useState } from "react"
import { useAuthStore } from "../../store/authStore"
import { Button, buttonVariants } from "../ui/button"
import { Settings, Bell } from "lucide-react"
import { NotificationDrawer } from "./NotificationDrawer"


export function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080B14]/80 backdrop-blur supports-[backdrop-filter]:bg-[#080B14]/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-[#00FF87]">
            GOLF<span className="text-white">DRAW</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-300">
            <Link to="/charities" className="hover:text-[#00FF87] transition-colors">Charities</Link>
            <Link to="/draws" className="hover:text-[#00FF87] transition-colors">Past Draws</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {profile?.role === "admin" && (
                <Link to="/admin" className={buttonVariants({ variant: "outline", className: "border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10" })}>Admin</Link>
              )}
              <Link to="/dashboard" className={buttonVariants({ variant: "ghost", className: "text-white hover:text-[#00FF87] hover:bg-white/5" })}>Dashboard</Link>
              <button 
                title="Notifications"
                onClick={() => setShowNotifications(true)}
                className={buttonVariants({ variant: "ghost", size: "icon", className: "text-slate-400 hover:text-white relative" })}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#00FF87] rounded-full border-2 border-[#080B14]"></span>
              </button>
              <Link title="Settings" to="/settings" className={buttonVariants({ variant: "ghost", size: "icon", className: "text-slate-400 hover:text-white" })}>
                <Settings className="h-5 w-5" />
              </Link>
              <Button variant="destructive" onClick={signOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/auth" className={buttonVariants({ variant: "ghost", className: "text-white hover:text-[#00FF87] hover:bg-white/5" })}>Log in</Link>
              <Link to="/subscribe" className={buttonVariants({ className: "bg-[#00FF87] text-[#080B14] hover:bg-[#00FF87]/90 font-bold" })}>Subscribe Now</Link>
            </>
          )}
        </div>
      </div>
      <NotificationDrawer isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </nav>
  )
}
