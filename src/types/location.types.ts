export interface Location {
  id: string
  user_id: string
  address: string
  city: string
  country: string
  region: string
  postal_code: string
  phone: string
  created_at: string
  updated_at: string
}

export interface CreateLocation {
  address: string
  city: string
  country: string
  region: string
  postal_code: string
  phone: string
}

export interface UpdateLocation {
  address?: string
  city?: string
  country?: string
  region?: string
  postal_code?: string
  phone?: string
}