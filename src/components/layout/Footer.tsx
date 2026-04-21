export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080B14] py-8 text-center text-slate-400">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Golf Draw Platform. All rights reserved.
        </p>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <a href="/terms" className="hover:text-[#00FF87]">Terms of Service</a>
          <a href="/privacy" className="hover:text-[#00FF87]">Privacy Policy</a>
          <a href="/support" className="hover:text-[#00FF87]">Contact Support</a>
        </div>
      </div>
    </footer>
  )
}
