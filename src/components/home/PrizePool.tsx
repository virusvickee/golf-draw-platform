import { useEffect, useState } from "react"


export function PrizePool() {
  const [pool, setPool] = useState(0)
  const targetPool = 25450 // Example default

  useEffect(() => {
    // Basic counter animation
    const duration = 2000
    const steps = 60
    const stepTime = duration / steps
    let current = 0
    const increment = targetPool / steps

    const timer = setInterval(() => {
      current += increment
      if (current >= targetPool) {
        setPool(targetPool)
        clearInterval(timer)
      } else {
        setPool(Math.floor(current))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [targetPool])

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#FFD700]/5 mix-blend-screen" />
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">Current Estimated Pool</h2>
        
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="absolute -inset-4 bg-[#FFD700] opacity-20 blur-2xl rounded-full" />
            <div className="relative text-7xl md:text-9xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#FFD700]">
              £{pool.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-[#080B14]/80 backdrop-blur border border-[#FFD700]/20">
            <div className="text-sm uppercase tracking-wider text-[#FFD700] mb-2 font-bold">Jackpot (5 Matches)</div>
            <div className="text-3xl font-mono text-white">40%</div>
            <div className="text-slate-400 mt-2 text-sm">+ Any Rollover</div>
          </div>
          <div className="p-6 rounded-xl bg-[#080B14]/80 backdrop-blur border border-white/10">
            <div className="text-sm uppercase tracking-wider text-slate-300 mb-2 font-bold">Second Tier (4 Matches)</div>
            <div className="text-3xl font-mono text-white">35%</div>
            <div className="text-slate-400 mt-2 text-sm">Split equally</div>
          </div>
          <div className="p-6 rounded-xl bg-[#080B14]/80 backdrop-blur border border-white/10">
            <div className="text-sm uppercase tracking-wider text-slate-300 mb-2 font-bold">Third Tier (3 Matches)</div>
            <div className="text-3xl font-mono text-white">25%</div>
            <div className="text-slate-400 mt-2 text-sm">Split equally</div>
          </div>
        </div>
      </div>
    </section>
  )
}
