"use client"

import type { ApiListingResponse, FeaturedListing } from "@/api/publicApi"; // Import FeaturedListing and ApiListingResponse
import { convertApiListingToFeaturedListing } from "@/api/publicApi"; // Import converter
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Added Table components
import { adminApi } from "@/features/admin/api/adminApi";
import { AdminLayout } from "@/features/admin/components/layout/AdminLayout";
import { useToast } from "@/hooks/useToast";
import type { Booking, BookingStatus } from "@/types/listing.types"; // Added Booking and BookingStatus
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle, ChevronRight, DollarSign, ExternalLink, Eye, FileText, MapPin, PackageCheck, PackageX, RefreshCw, Trash2, UserCircle, XCircle } from "lucide-react"; // Added more icons for booking status
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<FeaturedListing | null>(null); // Use FeaturedListing
  const [bookings, setBookings] = useState<Booking[]>([]); // Added state for bookings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Listing ID is missing.");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const rawListingData = await adminApi.getListing(id); 
        if (!rawListingData) {
            throw new Error("Listing data not found from API.");
        }
        const featuredListingData = await convertApiListingToFeaturedListing(rawListingData as unknown as ApiListingResponse);
        setListing(featuredListingData);

        // Fetch bookings
        const listingBookings = await adminApi.getListingBookings(id);
        setBookings(listingBookings || []);

      } catch (err) {
        console.error("Error fetching listing details or bookings:", err);
        setError("Failed to load listing details or bookings.");
        toast({
          title: "Error",
          description: "Could not fetch listing details or bookings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, toast]);

  const handleDeleteListing = async () => {
    if (!listing) return;
    // TODO: Implement delete functionality with confirmation dialog
    // This would likely call adminApi.deleteListing(listing.id)
    // and then navigate away or refresh data.
    toast({ title: "Info", description: `Delete action for ${listing.title} (ID: ${listing.id}) to be implemented.` });
  };

  
  const getStatusBadge = (status: string | undefined) => { // status can be undefined
    switch (status?.toLowerCase()) {
      case "available":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="mr-1 h-3 w-3" />Available</Badge>;
      case "booked": // This status is for the listing itself, not a specific booking
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300"><CalendarDays className="mr-1 h-3 w-3" />Booked (Overall)</Badge>;
      case "inactive":
      case "unavailable": // Added unavailable as a synonym for inactive based on some conventions
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300"><XCircle className="mr-1 h-3 w-3" />Inactive</Badge>;
      case "pending": // This status is for the listing itself (e.g. pending approval)
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300"><AlertTriangle className="mr-1 h-3 w-3" />Pending Approval</Badge>;
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>; // Handle undefined status
    }
  };

  const getBookingStatusBadge = (status: BookingStatus | undefined) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300"><RefreshCw className="mr-1 h-3 w-3" />Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300"><CheckCircle className="mr-1 h-3 w-3" />Confirmed</Badge>;
      case "booked": // This is a booking status, distinct from listing's "booked" status
         return <Badge variant="outline" className="bg-sky-100 text-sky-800 border-sky-300"><CalendarDays className="mr-1 h-3 w-3" />Booked</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300"><PackageCheck className="mr-1 h-3 w-3" />Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300"><PackageX className="mr-1 h-3 w-3" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };


  if (loading) {
    return <AdminLayout><div className="flex justify-center items-center h-screen"><p>Loading listing details...</p></div></AdminLayout>;
  }

  if (error) {
    return <AdminLayout><div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
    </div></AdminLayout>;
  }

  if (!listing) {
    return <AdminLayout><div className="flex flex-col items-center justify-center h-screen">
        <p>Listing not found.</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
    </div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-6">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-start">
                <div>
                    <CardTitle className="text-3xl font-bold mb-2 flex items-center">
                        <Link to={`/listings/${listing.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                            {listing.title}
                            <ExternalLink className="ml-2 h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                        </Link>
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                        <span>ID: {listing.id}</span>
                        <span>|</span>
                        <span>Category: {listing.category?.name || "N/A"}</span>
                        <span>|</span>
                        <span>Created: {new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="mt-2 md:mt-0">
                    {getStatusBadge(listing.status)}
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                {listing.media && listing.media?.length > 0 ? (
                  <div className="rounded-lg overflow-hidden border">
                    <img 
                        src={listing.media[0]?.media_url} 
                        alt={listing.title} 
                        className="w-full h-auto object-cover max-h-[500px]" 
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/placeholder/600/400"; }}
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border bg-muted flex items-center justify-center h-[300px] md:h-[500px]">
                    <p>No media available</p>
                  </div>
                )}
                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{listing.description || "No description provided."}</p>
                </div>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Owner Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {listing.owner_id ? (
                        <Link 
                            to={`/admin/users/${listing.owner_id}`} 
                            className="flex items-center justify-between space-x-3 hover:bg-accent p-3 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                        >
                            <div className="flex items-center space-x-3">
                                <Avatar>
                                    <AvatarFallback>{listing.owner_id.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">View Owner (ID: {listing.owner_id})</p>
                                    <p className="text-sm text-muted-foreground">Click to see user details</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </Link>
                    ) : (
                        <p className="text-muted-foreground">Owner ID not available.</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Listing Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center"><DollarSign className="h-4 w-4 mr-2 text-primary" /> Price: ETB {listing.price?.toLocaleString()} / night</div>
                    <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-primary" /> Location: {listing.city}, {listing.country}</div>
                    {listing.address && <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-primary" /> Address: {listing.address}</div>}
                    <div className="flex items-center"><Eye className="h-4 w-4 mr-2 text-primary" /> Views: {listing.views_count || 0}</div>
                    <div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-primary" /> Last Updated: {new Date(listing.updated_at).toLocaleDateString()}</div>
                  </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Admin Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                        {/* <Button onClick={handleEditListing} variant="outline"><Edit3 className="mr-2 h-4 w-4" /> Edit Listing</Button> */}
                        {/* TODO: Add other actions like Approve/Reject/Suspend if applicable, based on listing.status */}
                        <Button onClick={handleDeleteListing} variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Listing</Button>
                    </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking History Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Renter</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booked On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings?.length > 0 && bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                          {booking.id.substring(0,8)}...
                      </TableCell>
                      <TableCell>
                        {booking.renter_id ? (
                           <Link to={`/admin/users/${booking.renter_id}`} className="hover:underline flex items-center">
                             <UserCircle className="mr-1.5 h-4 w-4 text-muted-foreground" /> {booking.renter_id.substring(0,8)}...
                           </Link>
                        ) : (
                            "N/A"
                        )}
                      </TableCell>
                      <TableCell>{new Date(booking.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(booking.end_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">ETB {booking.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>{getBookingStatusBadge(booking.status)}</TableCell>
                      <TableCell>{new Date(booking.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <FileText className="h-12 w-12 mb-4" />
                <p className="text-lg">No bookings found for this listing.</p>
                <p className="text-sm">Once renters book this listing, their booking history will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* End Booking History Section */}

      </div>
    </AdminLayout>
  );
}

