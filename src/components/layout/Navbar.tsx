import { Link } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { Button } from "../ui/button"

export function Navbar() {
  const { user, profile, signOut } = useAuthStore()

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
                <Link to="/admin">
                  <Button variant="outline" className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10">
                    Admin
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="ghost" className="text-white hover:text-[#00FF87] hover:bg-white/5">
                  Dashboard
                </Button>
              </Link>
              <Button variant="destructive" onClick={signOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" className="text-white hover:text-[#00FF87] hover:bg-white/5">
                  Log in
                </Button>
              </Link>
              <Link to="/subscribe">
                <Button className="bg-[#00FF87] text-[#080B14] hover:bg-[#00FF87]/90 font-bold">
                  Subscribe Now
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
