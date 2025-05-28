export interface Location {
  address: string;
  city: string;
  country: string;
  created_at: string;
  id: string;
  phone: string;
  postal_code: string;
  region: string;
  updated_at: string;
  user_id: string;
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