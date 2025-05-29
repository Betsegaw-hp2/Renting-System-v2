"use client"

import { ArrowLeft, CheckCircle, Clock, Mail, ShieldCheck, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"; // Assuming react-router-dom for useParams and Link
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { useToast } from "../../../hooks/useToast"; // Assuming you have a toast hook
import type { User, UserKYC as UserKycType } from "../../../types/user.types"; // Renamed import to avoid conflict
import { adminApi } from "../api/adminApi"; // Import adminApi
import { AdminLayout } from "../components/layout/AdminLayout";

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const { toast } = useToast()

  const [user, setUser] = useState<User | null>(null) // User type from user.types.ts
  const [kycDetails, setKycDetails] = useState<UserKycType | null>(null) // UserKycType from user.types.ts
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingKyc, setLoadingKyc] = useState(true)
  const [isApproving, setIsApproving] = useState(false)

  useEffect(() => {
    if (!userId) return

    const fetchUserData = async () => {
      setLoadingUser(true)
      try {
        const user = await adminApi.getUser(userId);
        setUser(user); // Assuming API returns { data: User }
      } catch (error) {
        console.error("Error fetching user details:", error)
        toast({ title: "Error", description: "Failed to fetch user details.", variant: "destructive" })
      } finally {
        setLoadingUser(false)
      }
    }

    const fetchKycData = async () => {
      setLoadingKyc(true)
      try {
        const kycData = await adminApi.getUserKyc(userId);
        setKycDetails(kycData); // kycData is UserKycType | null
      } catch (error) {
        console.error("Error fetching KYC details:", error)
        // Error handling for non-404 errors, as 404 now returns null from adminApi.getUserKyc
        toast({ title: "Error", description: "Failed to fetch KYC details.", variant: "destructive" })
      } finally {
        setLoadingKyc(false)
      }
    }

    fetchUserData()
    fetchKycData()
  }, [userId, toast])

  const handleApproveUser = async () => {
    if (!userId || !user) return // Ensure user is not null
    setIsApproving(true)
    try {
      await adminApi.approveUser(userId); 
      toast({ title: "Success", description: "User approved successfully." })
      
      // Refetch user data to get updated kyc_verified status
      const updatedUser = await adminApi.getUser(userId);
      setUser(updatedUser);
      
      // Refetch KYC documents details as they might have been created or updated
      const updatedKycDetails = await adminApi.getUserKyc(userId);
      setKycDetails(updatedKycDetails);

      // No need to manually set kycDetails to an "APPROVED" state here,
      // as the user.kyc_verified flag is the source of truth for approval status.

    } catch (error) {
      console.error("Error approving user:", error)
      toast({ title: "Error", description: "Failed to approve user.", variant: "destructive" })
    } finally {
      setIsApproving(false)
    }
  }

  const getInitials = (name: string) => name.split(" ").map((part) => part[0]).join("").toUpperCase()
  
  const getKycStatusBadge = (kycVerified: boolean | undefined, kycDocs: UserKycType | null) => {
    if (kycVerified) {
      return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
    }
    if (kycDocs) { // Documents submitted but not yet verified (or rejected - needs more info for rejected state)
      return <Badge className="bg-yellow-100 text-yellow-700">Pending Review</Badge>;
    }
    return <Badge variant="secondary">Not Submitted</Badge>;
  }

  if (loadingUser || loadingKyc) {
    return (
      <AdminLayout>
        <div className="p-6">Loading user details...</div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="p-6">User not found.</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/users"> 
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.profile_picture || undefined} alt={`${user.first_name} ${user.last_name}`} />
                <AvatarFallback>{getInitials(`${user.first_name} ${user.last_name}`)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{`${user.first_name} ${user.last_name}`}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center">
                <UserCircle className="mr-2 h-5 w-5 text-muted-foreground" />
                <span>Role: <Badge variant="outline">{user.role}</Badge></span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-muted-foreground" />
                <span>Email Verified: {user.is_verified ? <Badge className="bg-green-100 text-green-700">Yes</Badge> : <Badge variant="destructive">No</Badge>}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
               <div className="flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-muted-foreground" />
                <span>Overall Status: {(user.kyc_verified && user.is_verified) ? <Badge className="bg-blue-100 text-blue-700">Approved</Badge> : <Badge variant="secondary">Pending</Badge>}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>KYC Information</CardTitle>
              <CardDescription>Know Your Customer documents and verification status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user && (
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">KYC Status:</span>
                  {getKycStatusBadge(user.kyc_verified, kycDetails)}
                </div>
              )}

              {kycDetails ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Documents submitted on: {new Date(kycDetails.created_at).toLocaleString()}
                  </p>
                  {/* Display links to the KYC documents/images */}  
                  <div>
                    <h4 className="font-medium mb-2">Documents:</h4>
                    <ul className="space-y-2">
                      {kycDetails.frontside && (
                        <li className="text-sm">
                          <a href={kycDetails.frontside} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Front Side ID
                          </a>
                        </li>
                      )}
                      {kycDetails.backside && (
                        <li className="text-sm">
                          <a href={kycDetails.backside} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Back Side ID
                          </a>
                        </li>
                      )}
                      {kycDetails.face && (
                        <li className="text-sm">
                          <a href={kycDetails.face} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Face Photo
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Show approve button if user exists, KYC is not yet verified, and documents are present */} 
                  {user && !user.kyc_verified && kycDetails && (
                    <>
                      <Separator className="my-4" />
                      <Button onClick={handleApproveUser} disabled={isApproving} className="w-full md:w-auto">
                        {isApproving ? "Approving..." : "Approve User KYC"}
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Approving will mark the user's KYC as verified.
                      </p>
                    </>
                  )}
                   {user && user.kyc_verified && (
                     <p className="text-sm font-medium text-green-600 mt-4">User KYC is verified.</p>
                   )}
                </>
              ) : (
                <p>No KYC documents submitted.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Placeholder for other management actions like Edit, Suspend, etc. */}
        {/* <Card>
          <CardHeader><CardTitle>Other Actions</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline">Edit User Details</Button>
            <Button variant="destructive">Suspend User</Button>
          </CardContent>
        </Card> */}
      </div>
    </AdminLayout>
  )
}
