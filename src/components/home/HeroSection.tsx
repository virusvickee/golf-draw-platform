import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00FF87] to-[#FFD700] blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Play Golf. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] to-[#FFD700]">
              Win Big. Give Back.
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the ultimate monthly golf draw. Submit your Stableford scores, 
            enter the thrilling monthly lottery, and support your favourite charities every time you play.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/subscribe">
            <Button size="lg" className="h-14 px-8 text-lg font-bold bg-[#00FF87] text-[#080B14] hover:bg-[#00FF87]/90 rounded-full w-full sm:w-auto shadow-[0_0_20px_rgba(0,255,135,0.3)]">
              Start Your Subscription
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-medium border-white/20 hover:bg-white/5 rounded-full w-full sm:w-auto text-white">
              See How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Stats preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-white/10 pt-10"
        >
          <div>
            <div className="text-4xl font-mono font-bold text-white mb-2">£25k+</div>
            <div className="text-sm text-slate-400 uppercase tracking-widest">Monthly Prize Pool</div>
          </div>
          <div>
            <div className="text-4xl font-mono font-bold text-[#FFD700] mb-2">10-50%</div>
            <div className="text-sm text-slate-400 uppercase tracking-widest">To Charity</div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-4xl font-mono font-bold text-[#00FF87] mb-2">5</div>
            <div className="text-sm text-slate-400 uppercase tracking-widest">Scores to Enter</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
