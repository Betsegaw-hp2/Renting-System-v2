"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format, differenceInDays } from "date-fns"
import { CalendarIcon, Clock, Edit2Icon, Save } from "lucide-react"
import { publicApi } from "../api/publicApi"
import { tenantApi, type Booking } from "@/features/tenant/api/tenantApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/useToast"
import { Badge } from "@/components/ui/badge"
import { Header } from "@radix-ui/react-accordion"

interface Listing {
  id: string
  title: string
  description: string
  price: number
}

const BookingDetailPage = () => {
  const { listingId, bookingId } = useParams<{ listingId: string; bookingId: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Calculate daily rate from monthly price
  const calculateDailyRate = (monthlyPrice: number) => {
    return monthlyPrice / 30
  }

  // Calculate total amount based on selected dates
  const calculateTotalAmount = () => {
    if (!startDate || !endDate || !listing) return 0
    const days = differenceInDays(endDate, startDate)
    if (days <= 0) return 0
    const dailyRate = calculateDailyRate(listing.price)
    return Math.round(dailyRate * days * 100) / 100
  }

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!listingId || !bookingId) {
        setError("Missing listing ID or booking ID")
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch booking details
        const bookingData = await tenantApi.getBooking(listingId, bookingId)
        setBooking(bookingData)
        setStartDate(new Date(bookingData.start_date))
        setEndDate(new Date(bookingData.end_date))

        // Fetch listing details
        const listings = await publicApi.getFeaturedListings()
        const foundListing = listings.find((l) => l.id === listingId)
        if (foundListing) {
          setListing(foundListing)
        } else {
          setError("Listing not found")
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching booking details:", err)
        setError("Failed to load booking details. Please try again later.")
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [listingId, bookingId])

  const handleUpdateBooking = async () => {
    if (!listingId || !bookingId || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Missing required information for update",
        variant: "destructive",
      })
      return
    }

    // Validate dates
    if (endDate <= startDate) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    const totalAmount = calculateTotalAmount()
    if (totalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Total amount must be greater than zero",
        variant: "destructive",
      })
      return
    } 

    try {
      setIsUpdating(true)

      // Update booking using tenantApi
      const updatedBooking = await tenantApi.updateBooking(listingId, bookingId, {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_amount: totalAmount,
      })

      setBooking(updatedBooking)
      setIsEditDialogOpen(false)

      toast({
        title: "Booking Updated",
        description: "Your booking has been successfully updated",
      })
    } catch (err) {
      console.error("Error updating booking:", err)
      toast({
        title: "Update Failed",
        description: "Failed to update booking. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "booked":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "in_escrow":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "disputed":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto mt-10 max-w-4xl px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto mt-10 max-w-4xl px-4">
        <Card>
          <CardHeader>
            <CardTitle>Booking Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The booking you're looking for could not be found.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    
    <div className="container mx-auto mt-10 max-w-4xl px-4 pb-16">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Booking Details</CardTitle>
              <CardDescription>Booking #{booking.id.substring(0, 8)}</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
              disabled={booking.status === "completed" || booking.status === "cancelled"}
            >
              <Edit2Icon className="mr-2 h-4 w-4" />
              Edit Booking
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Section */}
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Booking Status</p>
              <Badge className={`mt-1 ${getStatusBadgeColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Status</p>
              <Badge className={`mt-1 ${getPaymentStatusBadgeColor(booking.payment_status)}`}>
                {booking.payment_status
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Badge>
            </div>
          </div>

          {/* Dates Section */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-3 font-medium">Booking Period</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-in Date</p>
                  <p className="font-medium">{format(new Date(booking.start_date), "PPP")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-out Date</p>
                  <p className="font-medium">{format(new Date(booking.end_date), "PPP")}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="font-medium">
                  {differenceInDays(new Date(booking.end_date), new Date(booking.start_date))} days
                </p>
              </div> 
            </div>
          </div>

          {/* Payment Section */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-3 font-medium">Payment Details</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <p className="text-gray-600">Total Amount</p>
                <p className="font-medium">${booking.total_amount.toFixed(2)}</p>
              </div>
              {booking.payment_reference && (
                <div className="flex justify-between">
                  <p className="text-gray-600">Payment Reference</p>
                  <p className="font-medium">{booking.payment_reference}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid gap-4 text-sm text-gray-500 md:grid-cols-2">
            <div>
              <p>Created: {format(new Date(booking.created_at), "PPP 'at' p")}</p>
            </div>
            <div>
              <p>Last Updated: {format(new Date(booking.updated_at), "PPP 'at' p")}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          {booking.status === "pending" && <Button variant="destructive">Cancel Booking</Button>}
        </CardFooter>
      </Card>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking Dates</DialogTitle>
            <DialogDescription>Update the start and end dates for your booking.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                disabledDates={(date) => {
                  // Disable dates in the past
                  return date < new Date()
                }}
              />
              <p className="text-xs text-gray-500">Select the new check-in date</p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                disabledDates={(date) => {
                  // Disable dates before start date
                  return startDate ? date <= startDate : date <= new Date()
                }}
              />
              <p className="text-xs text-gray-500">Select the new check-out date</p>
            </div>

            {startDate && endDate && endDate > startDate && listing && (
              <div className="mt-2 rounded-md bg-blue-50 p-3">
                <h4 className="font-medium text-blue-800">Booking Summary</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Duration:</span>
                    <span className="font-medium text-blue-900">{differenceInDays(endDate, startDate)} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Daily Rate:</span>
                    <span className="font-medium text-blue-900">${calculateDailyRate(listing.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-1">
                    <span className="font-medium text-blue-700">New Total:</span>
                    <span className="font-medium text-blue-900">${calculateTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBooking}
              disabled={isUpdating || !startDate || !endDate || endDate <= startDate || calculateTotalAmount() <= 0}
            >
              {isUpdating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BookingDetailPage