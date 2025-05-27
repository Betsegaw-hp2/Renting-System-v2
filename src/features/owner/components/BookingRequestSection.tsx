"use client"

import type React from "react"
import { Calendar, DollarSign, Clock, Check, X, Mail, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/useToast"
import type { Booking } from "@/features/owner/api/fakeOwnerApi"
import { fakeOwnerApi } from "@/features/owner/api/fakeOwnerApi"

interface BookingRequestsSectionProps {
  bookings: Booking[]
  isLoading?: boolean
  onBookingUpdate?: (bookingId: string, action: "confirmed" | "cancelled") => void
}

const BookingRequestsSection: React.FC<BookingRequestsSectionProps> = ({ bookings, isLoading, onBookingUpdate }) => {
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getBookingStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          className: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
          icon: Clock,
          label: "Pending",
        }
      case "confirmed":
        return {
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
          icon: Check,
          label: "Confirmed",
        }
      case "cancelled":
        return {
          className: "bg-red-50 text-red-700 border-red-200 font-medium",
          icon: X,
          label: "Cancelled",
        }
      case "completed":
        return {
          className: "bg-blue-50 text-blue-700 border-blue-200 font-medium",
          icon: Check,
          label: "Completed",
        }
      default:
        return {
          className: "bg-gray-50 text-gray-700 border-gray-200 font-medium",
          icon: Clock,
          label: "Unknown",
        }
    }
  }

  const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          className: "bg-green-50 text-green-700 border-green-200",
          icon: CreditCard,
          label: "Paid",
        }
      case "pending":
        return {
          className: "bg-yellow-50 text-yellow-700 border-yellow-200",
          icon: Clock,
          label: "Payment Pending",
        }
      case "in_escrow":
        return {
          className: "bg-blue-50 text-blue-700 border-blue-200",
          icon: CreditCard,
          label: "In Escrow",
        }
      case "disputed":
        return {
          className: "bg-red-50 text-red-700 border-red-200",
          icon: X,
          label: "Disputed",
        }
      case "failed":
        return {
          className: "bg-red-50 text-red-700 border-red-200",
          icon: X,
          label: "Failed",
        }
      default:
        return {
          className: "bg-gray-50 text-gray-700 border-gray-200",
          icon: Clock,
          label: "Unknown",
        }
    }
  }

  const handleBookingAction = async (bookingId: string, action: "confirmed" | "cancelled") => {
    if (onBookingUpdate) {
      onBookingUpdate(bookingId, action)
    } else {
      try {
        await fakeOwnerApi.updateBookingStatus(bookingId, action)
        toast({
          title: "Success",
          description: `Booking ${action === "confirmed" ? "accepted" : "declined"} successfully`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to ${action === "confirmed" ? "accept" : "decline"} booking`,
          variant: "destructive",
        })
      }
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    return "R"
  }

  if (isLoading) {
    return (
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-blue-600" />
            Booking Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="animate-pulse border rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-40 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5 text-blue-600" />
          Booking Requests ({bookings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No booking requests</h3>
            <p className="text-sm text-gray-500">Booking requests from potential renters will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const bookingStatus = getBookingStatusConfig(booking.status)
              const paymentStatus = getPaymentStatusConfig(booking.payment_status)
              const BookingIcon = bookingStatus.icon
              const PaymentIcon = paymentStatus.icon

              return (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white"
                >
                  {/* Header with Renter Info and Status */}
                  <div className="flex-col items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                        <AvatarImage
                          src={booking.renter?.profile_picture || ""}
                          alt={`${booking.renter?.first_name} ${booking.renter?.last_name}`}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {getInitials(booking.renter?.first_name, booking.renter?.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {booking.renter?.first_name} {booking.renter?.last_name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          {booking.renter?.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-end py-4">
                      <Badge className={bookingStatus.className} variant="outline">
                        <BookingIcon className="h-3 w-3 mr-1" />
                        {bookingStatus.label}
                      </Badge>
                      <Badge className={paymentStatus.className} variant="outline">
                        <PaymentIcon className="h-3 w-3 mr-1" />
                        {paymentStatus.label}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Check-in</span>
                      </div>
                      <div className="font-semibold text-gray-900">{formatDate(booking.start_date)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-gray-700">Check-out</span>
                      </div>
                      <div className="font-semibold text-gray-900">{formatDate(booking.end_date)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Total Amount</span>
                      </div>
                      <div className="font-semibold text-gray-900 text-lg">{formatCurrency(booking.total_amount)}</div>
                    </div>
                  </div>

                  {/* Request Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>Requested on {formatDate(booking.created_at)}</span>
                  </div>

                  {/* Action Buttons */}
                  {booking.status === "pending" && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleBookingAction(booking.id, "confirmed")}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6"
                      >
                        <Check className="h-4 w-4" />
                        Accept Request
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookingAction(booking.id, "cancelled")}
                        className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 px-6"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default BookingRequestsSection
