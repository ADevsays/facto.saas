export interface Ad {
  id: string
  name: string
  description: string
  url: string
  image_url: string
  is_active: boolean
  created_at: string
  user_id?: string
  whop_membership_id?: string
  position?: number
  price?: number
  email?: string
  is_affiliate?: boolean
}

export interface AdPayload {
  name: string
  description: string
  url: string
  image_url: string
  position?: number
  price?: number
  email?: string
  is_affiliate?: boolean
}

export interface WhopMembership {
  id: string
  whop_user_id: string
  whop_membership_id: string
  email: string
  status: 'active' | 'inactive'
  used: boolean
  created_at: string
}

export interface AdSetupPayload {
  email: string
  password?: string
  name: string
  description: string
  url: string
  image_url: string
  position?: number
  token?: string
  price?: number
}

export interface AdSlot {
  position: number
  ad: Ad | null
  currentPrice: number
  nextPrice: number
  isAvailable: boolean
}

export interface CheckoutPayload {
  slot: number
  price?: number
  email?: string
}

export interface AdminAssignAdPayload {
  position: number
  name: string
  description?: string
  url: string
  image_url?: string
  price?: number
  is_active?: boolean
}
