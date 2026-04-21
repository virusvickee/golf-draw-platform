import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { Toaster } from "../ui/sonner"

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[#080B14] text-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  )
}
