import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuthStore } from "../store/authStore"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { toast } from "sonner"

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { fetchUser } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("full_name") as string

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      await fetchUser()
      toast.success("Account created successfully!")
      navigate("/select-charity")
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      await fetchUser()
      toast.success("Logged in successfully!")
      
      // Determine redirect based on location state or user role
      const from = (location.state as any)?.from
      
      if (from) {
        const redirectPath = from.pathname + (from.search || "") + (from.hash || "")
        navigate(redirectPath, { replace: true })
      } else {
        // Fetch the user data again to ensure we have the profile role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", (await supabase.auth.getUser()).data.user?.id)
          .single()

        if (profile?.role === "admin") {
          navigate("/admin")
        } else {
          navigate("/dashboard")
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to log in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#080B14]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0A0E1A] border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#00FF87]">Welcome to Golf Draw</h1>
          <p className="text-slate-400 mt-2">Sign in to your account or create a new one.</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#080B14] border border-white/5">
            <TabsTrigger value="login" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Login</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="email-login" className="text-slate-300">Email</Label>
                <Input 
                  id="email-login" 
                  name="email" 
                  type="email" 
                  required 
                  className="bg-[#080B14] border-white/10 text-white focus-visible:ring-[#00FF87]"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password-login" className="text-slate-300">Password</Label>
                <Input 
                  id="password-login" 
                  name="password" 
                  type="password" 
                  required 
                  className="bg-[#080B14] border-white/10 text-white focus-visible:ring-[#00FF87]"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#080B14] font-bold mt-6 h-12">
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="full_name" className="text-slate-300">Full Name</Label>
                <Input 
                  id="full_name" 
                  name="full_name" 
                  required 
                  className="bg-[#080B14] border-white/10 text-white focus-visible:ring-[#00FF87]"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="email-register" className="text-slate-300">Email</Label>
                <Input 
                  id="email-register" 
                  name="email" 
                  type="email" 
                  required 
                  className="bg-[#080B14] border-white/10 text-white focus-visible:ring-[#00FF87]"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password-register" className="text-slate-300">Password</Label>
                <Input 
                  id="password-register" 
                  name="password" 
                  type="password" 
                  required 
                  minLength={6}
                  className="bg-[#080B14] border-white/10 text-white focus-visible:ring-[#00FF87]"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#080B14] font-bold mt-6 h-12">
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
