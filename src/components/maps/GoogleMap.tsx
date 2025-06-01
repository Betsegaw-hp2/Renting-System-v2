import React, { useEffect, useRef, useState } from 'react'

interface GoogleMapProps {
  city?: string
  region?: string
  country?: string
  className?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export const GoogleMap: React.FC<GoogleMapProps> = ({ 
  city, 
  region, 
  country, 
  className = "w-full h-[200px] rounded-lg" 
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Construct the address string for geocoding
  const getLocationString = () => {
    const parts = []
    if (city) parts.push(city)
    if (region) parts.push(region)
    if (country) parts.push(country)
    return parts.join(', ')
  }

  const initializeMap = async () => {
    if (!mapRef.current || !window.google) return

    const locationString = getLocationString()
    if (!locationString) {
      setError('No location information available')
      return
    }

    try {
      const geocoder = new window.google.maps.Geocoder()
      
      // Geocode the location
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ address: locationString }, (results: any[], status: string) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results[0])
          } else {
            reject(new Error(`Geocoding failed: ${status}`))
          }
        })
      })

      const result = response as any
      const location = result.geometry.location

      // Create the map
      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: city ? 12 : region ? 10 : 8, // Adjust zoom based on specificity
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      })

      // Add a marker
      new window.google.maps.Marker({
        position: location,
        map: map,
        title: locationString,
      })

      setIsLoaded(true)
      setError(null)
    } catch (err) {
      console.error('Error initializing map:', err)
      setError('Failed to load map location')
    }
  }

  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeMap()
        return
      }

      // Check if the script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for it to load
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkLoaded)
            initializeMap()
          }
        }, 100)
        return
      }

      // Load Google Maps script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        initializeMap()
      }
      
      script.onerror = () => {
        setError('Failed to load Google Maps')
      }

      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [city, region, country])

  if (error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center border`}>
        <div className="text-center p-4">
          <p className="text-gray-500 text-sm">{error}</p>
          <p className="text-gray-400 text-xs mt-1">
            {getLocationString() || 'No location available'}
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center border`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 text-sm mt-2">Loading map...</p>
          <p className="text-gray-400 text-xs mt-1">
            {getLocationString()}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  )
}
