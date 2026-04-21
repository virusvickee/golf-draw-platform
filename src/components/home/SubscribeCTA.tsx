import { Link } from "react-router-dom"


export function SubscribeCTA() {
  return (
    <section className="py-32 relative overflow-hidden bg-[#00FF87]">
      <div className="absolute inset-0 bg-[#080B14] opacity-90 mix-blend-multiply" />
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
          Ready to Make Every <br className="hidden md:block" /> Round Count?
        </h2>
        <p className="text-xl text-[#00FF87]/80 mb-10 max-w-2xl mx-auto">
          Join the platform where your Stableford scores enter you to win grand prizes, while supporting the charities you love.
        </p>
        
        <Link to="/subscribe" className="inline-flex items-center justify-center h-16 px-12 text-xl font-bold bg-[#FFD700] text-[#080B14] hover:bg-white transition-colors rounded-full shadow-[0_0_30px_rgba(255,215,0,0.4)] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2">
          Start Your Sandbox
        </Link>
        <div className="mt-6 text-sm text-slate-400 font-medium">
          Cancel anytime. No hidden fees.
        </div>
      </div>
    </section>
  )
}
