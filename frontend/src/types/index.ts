export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'learner' | 'instructor' | 'admin';
  is_active: boolean;
  referral_code?: string;
  created_at: string;
  profile?: {
    bio?: string;
    avatar_url?: string;
    phone?: string;
    skills_interested: string[];
  };
  merchant_profile?: {
    business_name: string;
    description?: string;
    paypal_receiver_email?: string;
    rating: number;
    is_verified: boolean;
  };
}

export interface LearningDemand {
  id: string;
  user_id: string;
  raw_prompt: string;
  topic: string;
  related_skills: string[];
  objective?: string;
  preferred_difficulty: string;
  preferred_duration_hours: number;
  language: string;
  max_budget_cents: number;
  currency: string;
  preferred_schedule: string;
  delivery_format: string;
  confidence_score: number;
  status: 'pending' | 'clustered' | 'offered';
  created_at: string;
}

export interface DemandCluster {
  id: string;
  name: string;
  topic: string;
  summary: string;
  member_count: number;
  avg_budget_cents: number;
  currency: string;
  difficulty: string;
  status: string;
  created_at: string;
}

export interface OfferProposal {
  id: string;
  cluster_id?: string;
  merchant_id?: string;
  suggested_title: string;
  skills_covered: string[];
  learning_outcomes: string[];
  session_outline: string[];
  suggested_duration_hours: number;
  suggested_level: string;
  suggested_price_cents: number;
  currency: string;
  evidence_summary: string;
  constraints_summary?: string;
  status: 'draft' | 'approved' | 'rejected';
  created_at: string;
}

export interface Workshop {
  image_url?: string | null;
  language?: string | null;
  delivery_format?: string | null;
  id: string;
  merchant_id: string;
  offer_id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  price_cents: number;
  currency: string;
  total_seats: number;
  remaining_seats: number;
  scheduled_at: string;
  is_published: boolean;
  created_at: string;
  merchant_name?: string;
  instructor_name?: string | null;
}

export interface ReservationQuote {
  workshop_id: string;
  base_price_cents: number;
  rewards_applied: {
    campaign_id: string;
    campaign_name: string;
    campaign_type: string;
    discount_cents: number;
  }[];
  store_credit_applied_cents: number;
  final_amount_cents: number;
  currency: string;
  seat_available: boolean;
}

export interface Reservation {
  id: string;
  workshop_id: string;
  workshop_title?: string;
  attended?: boolean | null;
  reschedule_status?: string | null;
  workshop?: Pick<Workshop, 'image_url' | 'description' | 'category' | 'difficulty' | 'scheduled_at' | 'duration_hours' | 'total_seats' | 'remaining_seats'> | null;
  user_id: string;
  final_amount_cents: number;
  currency: string;
  status: 'pending_payment' | 'confirmed' | 'cancelled';
  paypal_order_id?: string;
  paypal_capture_id?: string;
  created_at: string;
  confirmed_at?: string;
}

export interface RewardCampaign {
  id: string;
  merchant_id: string;
  name: string;
  campaign_type: 'welcome' | 'early_bird' | 'store_credit' | 'digital_gift' | 'referral' | 'badge';
  discount_amount_cents: number;
  discount_percentage: number;
  min_spend_cents: number;
  total_budget_cents: number;
  remaining_budget_cents: number;
  max_per_user: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface RewardsDashboard {
  store_credit_cents: number;
  currency: string;
  digital_gifts: {
    id: string;
    workshop_id?: string;
    title: string;
    download_url?: string;
    access_code?: string;
    redeemed_at: string;
  }[];
  achievement_badges: {
    badge_id: string;
    title: string;
    description: string;
    unlocked: boolean;
  }[];
  ledger?: {
    id: string;
    reward_type: string;
    delta_cents: number;
    description: string;
    created_at: string;
  }[];
  available_campaigns?: {
    id: string;
    name: string;
    campaign_type: string;
    discount_amount_cents: number;
    discount_percentage: number;
    min_spend_cents: number;
  }[];
  first_purchase_eligible: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  type?: string;
  is_read: boolean;
  created_at: string;
}

export interface WorkshopRecommendation {
  workshop: Workshop;
  alignment_percentage: number;
  reasons: string[];
  based_on_demands?: number;
}

export interface WorkshopMaterials {
  workshop_id: string;
  workshop_title: string;
  instructor?: string;
  access_code: string;
  download_url?: string;
  deliverables: string[];
}

export interface AnalyticsOverview {
  total_demands: number;
  active_clusters: number;
  published_workshops: number;
  total_reservations: number;
  confirmed_reservations: number;
  total_revenue_cents: number;
  total_rewards_redeemed_cents: number;
  conversion_rate_percentage: number;
}

export interface ResearchExperiment {
  id: string;
  experiment_name: string;
  baseline_name: string;
  dataset_size: number;
  metric_purity: number;
  metric_ari: number;
  metric_constraint_violation_rate: number;
  latency_ms: number;
  status: string;
  details: Record<string, any>;
  created_at: string;
}


export interface AdvisorTurn {
  id: string;
  question: string;
  answer: string;
  sources: { id: string; title: string }[];
  mode: 'model' | 'catalog';
}
