import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    activeSubscribers: 0,
    currentPool: 0,
    revenue: 0
  })

  // Mocking detailed charting data due to empty db
  const monthlyRevenueData = [
    { name: "Jan", revenue: 4500 },
    { name: "Feb", revenue: 5200 },
    { name: "Mar", revenue: 7800 },
    { name: "Apr", revenue: 9990 }
  ]

  const matchData = [
    { name: "3 Matches", count: 120 },
    { name: "4 Matches", count: 45 },
    { name: "5 Matches", count: 2 }
  ]

  const charityData = [
    { name: "Golf Fore Good", value: 3400 },
    { name: "Watering the Greens", value: 2100 },
    { name: "Fairway Helpers", value: 1500 }
  ]
  const COLORS = ['#00FF87', '#FFD700', '#00BFFF', '#FF6347']

  useEffect(() => {
    fetchHighLevelStats()
  }, [])

  const fetchHighLevelStats = async () => {
    try {
      const { count, error } = await supabase.from("subscriptions").select("*", { count: 'exact', head: true }).eq('status', 'active')
      if (error) throw error
      
      const subs = count || 0
      
      // Monthly sub = £9.99
      const rev = subs * 9.99
      
      setStats({
        activeSubscribers: subs,
        revenue: rev,
        currentPool: rev * 0.50 // Assuming 50%
      })
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Overview</h1>
        <p className="text-slate-400 mt-1">Platform performance and distribution metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0A0E1A] border border-white/10">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Active Subscribers</div>
          <div className="text-4xl font-mono font-bold text-white">{stats.activeSubscribers}</div>
          <div className="text-xs text-[#00FF87] mt-2">+12% from last month</div>
        </div>
        <div className="p-6 rounded-2xl bg-[#0A0E1A] border border-white/10">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Est. Monthly Revenue</div>
          <div className="text-4xl font-mono font-bold text-white">£{stats.revenue.toLocaleString()}</div>
        </div>
        <div className="p-6 rounded-2xl bg-[#0A0E1A] border border-white/10">
          <div className="text-sm font-bold text-[#FFD700] uppercase tracking-wider mb-2">Current Prize Pool</div>
          <div className="text-4xl font-mono font-bold text-[#FFD700]">£{stats.currentPool.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-2">Before rollovers</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="p-6 rounded-xl bg-[#0A0E1A] border border-white/10 h-[400px]">
          <h3 className="font-bold mb-6 text-slate-300">Revenue Growth</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={monthlyRevenueData}>
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#080B14', borderColor: '#ffffff20', color: 'white'}} />
              <Bar dataKey="revenue" fill="#00FF87" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Charity Distribution */}
        <div className="p-6 rounded-xl bg-[#0A0E1A] border border-white/10 h-[400px]">
          <h3 className="font-bold mb-6 text-slate-300">Charity Contributions</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={charityData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {charityData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: '#080B14', borderColor: '#ffffff20', color: 'white'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Draw Match Distribution */}
        <div className="p-6 rounded-xl bg-[#0A0E1A] border border-white/10 h-[400px] md:col-span-2">
          <h3 className="font-bold mb-6 text-slate-300">Historical Draw Matches</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={matchData}>
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#080B14', borderColor: '#ffffff20', color: 'white'}} />
              <Bar dataKey="count" fill="#FFD700" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
