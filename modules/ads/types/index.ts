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
}

export interface AdPayload {
  name: string
  description: string
  url: string
  image_url: string
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
  password: string
  name: string
  description: string
  url: string
  image_url: string
}
