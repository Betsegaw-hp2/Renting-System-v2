export interface Location {
	id: string
	userId: string
	address: string
	city: string
	country: string
	phone: string
	postalCode: string
	region: string
	createdAt: string
	updatedAt: string
  }
  
  export interface LocationPayload {
	address: string
	city: string
	country: string
	phone: string
	postal_code: string
	region: string
  }
  