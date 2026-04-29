export type Role = 'buyer' | 'creator'
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export interface Profile {
  id: string
  role: Role
  full_name: string | null
  username: string | null
  avatar_url: string | null
  banner_url: string | null
  shop_name: string | null
  bio: string | null
  location: string | null
  stripe_account_id: string | null
  stripe_onboarded: boolean
  created_at: string
}

export interface Listing {
  id: string
  creator_id: string
  title: string
  description: string | null
  price: number
  category: string
  images: string[]
  stock: number
  is_active: boolean
  created_at: string
  profiles?: Profile
  avg_rating?: number | null
  review_count?: number
}

export interface Review {
  id: string
  listing_id: string
  buyer_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
  }
}

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface Order {
  id: string
  buyer_id: string | null
  listing_id: string | null
  amount: number
  platform_fee: number
  stripe_session_id: string | null
  status: OrderStatus
  shipping_address: ShippingAddress | null
  created_at: string
  listings?: Listing & { profiles?: Profile }
  profiles?: Profile
}

export const CATEGORIES = [
  'Jewelry',
  'Ceramics',
  'Textiles',
  'Prints & Art',
  'Candles',
  'Accessories',
  'Home Decor',
  'Clothing',
] as const

export type Category = (typeof CATEGORIES)[number]
