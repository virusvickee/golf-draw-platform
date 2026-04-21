import { motion } from "framer-motion"

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Subscribe & Choose Charity",
      description: "Sign up for a monthly active subscription. Choose the charity you want to support and select your contribution percentage (10% to 50%)."
    },
    {
      number: "02",
      title: "Submit Your Scores",
      description: "Log up to 5 Stableford scores from your recent rounds. Your scores become your 'lottery numbers' for the monthly draw."
    },
    {
      number: "03",
      title: "The Monthly Draw",
      description: "At the start of each month, 5 numbers are drawn. Match 3, 4, or 5 numbers with your submitted scores to win a share of the prize pool!"
    }
  ]

  return (
    <section className="py-24 bg-[#0A0E1A]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Three simple steps to combine your love for golf with life-changing charity contributions and massive prize pools.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative p-8 rounded-2xl bg-[#080B14] border border-white/5 hover:border-[#00FF87]/30 transition-colors group"
            >
              <div className="text-6xl font-black text-white/5 mb-6 group-hover:text-[#00FF87]/10 transition-colors">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
