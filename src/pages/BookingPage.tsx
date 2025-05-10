"use client"

import type React from "react"

import { AlertTriangle, ArrowLeft, Calendar, CreditCard, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import type { FeaturedListing } from "../api/publicApi"
import { publicApi } from "../api/publicApi"
import { Header } from "../components/layout/Header"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Skeleton } from "../components/ui/skeleton"
import { usePermissions } from "../hooks/usePermissions"
import type { RootState } from "../store"

export default function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [listing, setListing] = useState<FeaturedListing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [guests, setGuests] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const permissions = usePermissions()

  useEffect(() => {
    // Redirect if not authenticated or not a tenant
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } })
      return
    }

    if (!permissions.canBookProperties) {
      navigate(`/listings/${id}`, {
        state: {
          error: "Only tenants can book properties. Please create a tenant account to make bookings.",
        },
      })
      return
    }

    const fetchListing = async () => {
      setIsLoading(true)
      try {
        if (!id) return

        // Fetch listing details
        const listings = await publicApi.getFeaturedListings()
        const foundListing = listings.find((listing) => listing.id === id)

        if (foundListing) {
          setListing(foundListing)

          // Set default dates (today and tomorrow)
          const today = new Date()
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          setStartDate(today.toISOString().split("T")[0])
          setEndDate(tomorrow.toISOString().split("T")[0])

          // Calculate initial price
          calculateTotalPrice(foundListing.price, today, tomorrow)
        } else {
          // Handle not found
          console.error("Listing not found")
        }
      } catch (error) {
        console.error("Error fetching listing details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [id, isAuthenticated, permissions, navigate, location.pathname])

  const calculateTotalPrice = (basePrice: number, start: Date, end: Date) => {
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    const price = basePrice * days
    const serviceFee = price * 0.1 // 10% service fee
    setTotalPrice(price + serviceFee)
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value)
    if (listing && endDate) {
      calculateTotalPrice(listing.price, new Date(e.target.value), new Date(endDate))
    }
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value)
    if (listing && startDate) {
      calculateTotalPrice(listing.price, new Date(startDate), new Date(e.target.value))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would submit the booking to the API
    alert(`Booking submitted for ${listing?.title} from ${startDate} to ${endDate} for ${guests} guests.`)

    // Navigate to bookings page
    navigate("/tenant/bookings")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Role-specific alerts */}
        {isAuthenticated && !permissions.canBookProperties && (
          <div className="container mx-auto px-4 mt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                Only tenants can book properties. Please create a tenant account to make bookings.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(`/listings/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to listing
          </Button>

          <h1 className="text-3xl font-bold mb-8">Book Your Stay</h1>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Skeleton className="h-8 w-2/3 mb-4" />
                <Skeleton className="h-6 w-1/3 mb-8" />
                <Skeleton className="h-40 mb-6" />
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
                <Skeleton className="h-12 mb-6" />
                <Skeleton className="h-12" />
              </div>
              <div>
                <Skeleton className="h-80" />
              </div>
            </div>
          ) : listing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Booking Form */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit}>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Listing Details</CardTitle>
                      <CardDescription>Review the property you're booking</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={listing.media[0]?.media_url || "/placeholder.svg?height=100&width=100"}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{listing.title}</h3>
                          <p className="text-gray-600 flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            {listing.city}, {listing.region}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            {listing.category.name} •
                            {listing.features?.bedrooms && ` ${listing.features.bedrooms} bedrooms • `}
                            {listing.features?.bathrooms && ` ${listing.features.bathrooms} bathrooms`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Trip Details</CardTitle>
                      <CardDescription>Select your check-in and check-out dates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Check-in Date</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <Input
                              id="startDate"
                              type="date"
                              value={startDate}
                              onChange={handleStartDateChange}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">Check-out Date</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <Input
                              id="endDate"
                              type="date"
                              value={endDate}
                              onChange={handleEndDateChange}
                              className="pl-10"
                              min={startDate}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-2">
                        <Label htmlFor="guests">Number of Guests</Label>
                        <Input
                          id="guests"
                          type="number"
                          min="1"
                          max={listing.features?.guests || 10}
                          value={guests}
                          onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                          required
                        />
                        {listing.features?.guests && (
                          <p className="text-sm text-gray-500">Maximum {listing.features.guests} guests allowed</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                      <CardDescription>Enter your payment details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input
                            id="cardName"
                            placeholder="John Doe"
                            defaultValue={user ? `${user.firstName} ${user.lastName}` : ""}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <Input id="cardNumber" placeholder="4242 4242 4242 4242" className="pl-10" required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" required />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <p className="text-sm text-gray-500">
                        Your payment information is encrypted and secure. We never store your full card details.
                      </p>
                    </CardFooter>
                  </Card>

                  <Button type="submit" className="w-full md:w-auto">
                    Confirm Booking
                  </Button>
                </form>
              </div>

              {/* Booking Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          ${listing.price.toLocaleString()} x{" "}
                          {Math.max(
                            1,
                            Math.ceil(
                              (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
                            ),
                          )}{" "}
                          {listing.priceUnit}s
                        </span>
                        <span>
                          $
                          {(
                            listing.price *
                            Math.max(
                              1,
                              Math.ceil(
                                (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
                              ),
                            )
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service fee</span>
                        <span>
                          $
                          {(
                            totalPrice -
                            listing.price *
                              Math.max(
                                1,
                                Math.ceil(
                                  (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
                                ),
                              )
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t pt-4 flex justify-between font-bold">
                        <span>Total</span>
                        <span>${totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start">
                    <p className="text-sm text-gray-500 mb-4">
                      You won't be charged until the owner accepts your booking request.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-md w-full">
                      <h4 className="font-medium text-blue-700 mb-1">Flexible cancellation</h4>
                      <p className="text-sm text-blue-600">
                        Cancel for free up to 24 hours before check-in for a full refund.
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
              <p className="text-gray-600 mb-8">The listing you're trying to book doesn't exist or has been removed.</p>
              <Button onClick={() => navigate("/browse")}>Browse Other Listings</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
