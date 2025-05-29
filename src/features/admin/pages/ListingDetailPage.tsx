import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/features/admin/components/layout/AdminLayout";
import { useToast } from "@/hooks/useToast";
import type { Booking, Review } from "@/types/listing.types";
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle, DollarSign, Edit3, Eye, MapPin, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../api/adminApi";

// Define interfaces for nested objects
interface MediaItem {
  id: string;
  media_url: string; // Matches current usage
  type: string;
}

interface TagItem {
  id: string;
  name: string;
}

interface OwnerInfo {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

interface LocationInfo {
  id: string;
  city: string;
  country: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface CategoryInfo {
  id: string;
  name: string;
}

// Main interface for the detailed listing view
interface AdminDetailedListing {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  views_count?: number;
  category: CategoryInfo | null;
  location: LocationInfo | null;
  owner: OwnerInfo | null;
  media: MediaItem[];
  tags: TagItem[]; // Changed from string[]
  // Other potential fields from a detailed admin endpoint
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<AdminDetailedListing | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Listing ID is missing.");
      setLoading(false);
      return;
    }

    const fetchListingDetails = async () => {
      try {
        setLoading(true);
        // Assume adminApi.getListing returns data compatible with AdminDetailedListing
        const listingData = await adminApi.getListing(id) as AdminDetailedListing;
        setListing(listingData);

        // Fetch related data like bookings and reviews
        try {
          const bookingsData = await adminApi.getListingBookings(id); // GET /listings/{id}/bookings
          setBookings(bookingsData);
        } catch (e) {
          console.warn("Failed to fetch bookings for listing:", id, e);
          toast({ title: "Warning", description: "Could not fetch booking details.", variant: "default" });
        }

        try {
          const reviewsData = await adminApi.getListingReviews(id); // GET /listings/{listingId}/reviews
          setReviews(reviewsData);
        } catch (e) {
          console.warn("Failed to fetch reviews for listing:", id, e);
          toast({ title: "Warning", description: "Could not fetch review details.", variant: "default" });
        }

      } catch (err) {
        console.error("Error fetching listing details:", err);
        setError("Failed to load listing details.");
        toast({
          title: "Error",
          description: "Could not fetch listing details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [id, toast]);

  const handleDeleteListing = async () => {
    if (!listing) return;
    // TODO: Implement delete functionality with confirmation dialog
    toast({ title: "Info", description: "Delete functionality to be implemented." });
  };

  const handleEditListing = () => {
    if (!listing) return;
    // TODO: Navigate to an edit page or open an edit modal
    toast({ title: "Info", description: "Edit functionality to be implemented." });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="mr-1 h-3 w-3" />Available</Badge>;
      case "booked":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300"><CalendarDays className="mr-1 h-3 w-3" />Booked</Badge>;
      case "inactive":
      case "unavailable":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300"><XCircle className="mr-1 h-3 w-3" />Inactive</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300"><AlertTriangle className="mr-1 h-3 w-3" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
                    <CardTitle className="text-3xl font-bold mb-2">{listing.title}</CardTitle>
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
                    {/* TODO: Implement a proper image carousel for multiple images */}
                    <img src={listing.media[0]?.media_url} alt={listing.title} className="w-full h-auto object-cover max-h-[500px]" />
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
                  <CardContent className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={listing.owner?.avatarUrl} alt={listing.owner?.name} />
                      <AvatarFallback>{listing.owner?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{listing.owner?.name || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">{listing.owner?.email || "No email"}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Listing Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center"><DollarSign className="h-4 w-4 mr-2 text-primary" /> Price: ${listing.price?.toLocaleString()} / night</div>
                    <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-primary" /> Location: {listing.location?.city}, {listing.location?.country}</div>
                    {listing.location?.address && <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-primary" /> Address: {listing.location.address}</div>}
                    <div className="flex items-center"><Eye className="h-4 w-4 mr-2 text-primary" /> Views: {listing.views_count || 0}</div>
                    <div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-primary" /> Last Updated: {new Date(listing.updated_at).toLocaleDateString()}</div>
                  </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Admin Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                        <Button onClick={handleEditListing} variant="outline"><Edit3 className="mr-2 h-4 w-4" /> Edit Listing</Button>
                        {/* TODO: Add other actions like Approve/Reject/Suspend if applicable */}
                        <Button onClick={handleDeleteListing} variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Listing</Button>
                    </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="bookings" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="media">Media Management</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings">
            <Card>
              <CardHeader><CardTitle>Bookings</CardTitle></CardHeader>
              <CardContent>
                {/* TODO: Display bookings table or list */}
                <p>Bookings information will be displayed here. (GET /listings/{id}/bookings)</p>
                {bookings?.length === 0 && <p className="text-muted-foreground">No bookings found for this listing.</p>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="media">
            <Card>
              <CardHeader><CardTitle>Media Management</CardTitle></CardHeader>
              <CardContent>
                {/* TODO: Display media, allow upload/delete (GET/POST /listings/{id}/media) */}
                <p>Media management section. (GET /listings/{id}/media, POST /listings/{id}/media)</p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {listing.media?.map(m => (
                        <div key={m.id} className="relative group border rounded-md overflow-hidden">
                            <img src={m.media_url} alt="Listing media" className="w-full h-32 object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="destructive" size="sm" onClick={() => alert("Delete media: " + m.id)}> <Trash2 className="h-4 w-4"/> </Button>
                            </div>
                        </div>
                    ))}
                 </div>
                 <Button className="mt-4">Upload Media</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tags">
            <Card>
              <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
              <CardContent>
                {/* TODO: Display tags, allow add/remove (GET /listings/{id}/tags, POST /listings/{id}/tags, DELETE /listings/{listingId}/tag/{tagId}) */}
                <p>Tags associated with this listing. (GET /listings/{id}/tags, POST /listings/{id}/tags)</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {listing.tags?.map(tag => <Badge key={tag.id} variant="secondary">{tag.name}</Badge>)}
                    {listing.tags?.length === 0 && <p className="text-muted-foreground">No tags found.</p>}
                </div>
                {/* Add UI for adding/removing tags */}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews">
            <Card>
              <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
              <CardContent>
                {/* TODO: Display reviews, allow admin actions (GET /listings/{listingId}/reviews, PATCH /listings/{listingId}/reviews/{reviewId}, etc.) */}
                <p>Reviews for this listing. (GET /listings/{listing.id}/reviews)</p>
                {reviews?.length === 0 && <p className="text-muted-foreground">No reviews yet for this listing.</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

