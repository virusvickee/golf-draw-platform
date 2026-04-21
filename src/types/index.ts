export type UserRole = "subscriber" | "admin"

export type Profile = {
  id: string
  full_name: string
  email: string
  role: UserRole
  selected_charity_id: string | null
  charity_contribution_percent: number
  created_at: string
}

export type Subscription = {
  id: string
  user_id: string
  plan: "monthly" | "yearly"
  status: "active" | "cancelled" | "lapsed"
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  amount_paid: number
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
}

export type Charity = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  website_url: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export type Score = {
  id: string
  user_id: string
  score: number // 1-45
  score_date: string
  created_at: string
}

export type Draw = {
  id: string
  draw_month: string // date
  status: "pending" | "simulated" | "published"
  draw_type: "random" | "algorithmic"
  drawn_numbers: number[] | null
  total_pool: number
  jackpot_pool: number
  second_pool: number
  third_pool: number
  jackpot_rolled_over: boolean
  rolled_over_amount: number
  published_at: string | null
  created_at: string
}

export type DrawEntry = {
  id: string
  draw_id: string
  user_id: string
  submitted_scores: number[]
  match_count: number
  is_winner: boolean
  created_at: string
}

export type Winner = {
  id: string
  draw_id: string
  user_id: string
  match_type: "5-match" | "4-match" | "3-match"
  prize_amount: number
  verification_status: "pending" | "approved" | "rejected"
  proof_url: string | null
  payment_status: "pending" | "paid"
  created_at: string
}
