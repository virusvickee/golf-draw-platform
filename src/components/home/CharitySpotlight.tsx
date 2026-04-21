import { Link } from "react-router-dom"
import { Button } from "../ui/button"

export function CharitySpotlight() {
  const charities = [
    {
      id: 1,
      name: "Golf Fore Good",
      description: "Providing golf access and youth mentorship through the sport.",
      image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&h=300&fit=crop",
    },
    {
      id: 2,
      name: "Watering the Greens",
      description: "Delivering clean water solutions to developing communities.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&h=300&fit=crop",
    },
    {
      id: 3,
      name: "Fairway Helpers",
      description: "Supporting caddies and golf course workers in need.",
      image: "https://images.unsplash.com/photo-1535136104956-618cbd274fd4?q=80&w=400&h=300&fit=crop",
    }
  ]

  return (
    <section className="py-24 bg-[#080B14]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Play with Purpose</h2>
            <p className="text-slate-400">
              Every month, our subscribers generate thousands in contributions for amazing causes. 
              You choose where your percentage goes.
            </p>
          </div>
          <Link to="/charities" className="mt-6 md:mt-0">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              View All Charities
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {charities.map(charity => (
            <Link to="/charities" key={charity.id} className="group block rounded-2xl overflow-hidden bg-[#0A0E1A] border border-white/5 hover:border-[#00FF87]/50 transition-all">
              <div className="h-48 overflow-hidden">
                <img 
                  src={charity.image} 
                  alt={charity.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{charity.name}</h3>
                <p className="text-sm text-slate-400 mb-6">{charity.description}</p>
                <div className="flex items-center text-[#00FF87] text-sm font-bold">
                  Choose this charity →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
