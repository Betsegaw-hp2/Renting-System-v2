"use client"

import type { RootState } from "@/store"

import type React from "react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Header } from "../components/layout/Header"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import OwnerHomePage from "../features/owner/pages/OwnerHomePage"
import TenantHomePage from "../features/tenant/pages/TenantHomePage"
import { usePermissions } from "../hooks/usePermissions"

export default function HomePage() {
  const navigate = useNavigate()
  const { user, is_authenticated , token } = useSelector((state: RootState) => state.auth)
  const permissions = usePermissions()


  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Redirect unauthenticated users to landing page
    if (!is_authenticated) {
      navigate("/")
    }

    if (permissions.isAdmin) {
     navigate("/admin/dashboard")
    }

  }, [is_authenticated, user, token, navigate, permissions.isAdmin])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/browse?query=${encodeURIComponent(searchQuery)}`)
  }

  // Render role-specific home pages
  if (permissions.isTenant) {
    return <TenantHomePage />
  }

  if (permissions.isOwner) {
    return <OwnerHomePage />
  }

  // Admin view
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSidebarToggle={false} />
      <main className="flex-1 bg-gray-50">
      {/* Hero Section with Search Skeleton */}
      <section className="bg-blue-600 py-12 text-white">
        <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-9 w-3/4 mb-4" /> {/* h1 */}
          <Skeleton className="h-5 w-full mb-8" /> {/* p */}
          <div className="flex gap-2">
          <div className="relative flex-1">
            <Skeleton className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
            <Skeleton className="h-12 w-full pl-10" /> {/* Input */}
          </div>
          <Skeleton className="h-12 w-24" /> {/* Button */}
          </div>
        </div>
        </div>
      </section>

      {/* Role-specific alerts Skeleton */}
      <div className="container mx-auto px-4 mt-6">
        <Alert variant="destructive" className="mb-4">
        <Skeleton className="h-4 w-4" /> {/* AlertTriangle */}
        <AlertTitle>
          <Skeleton className="h-5 w-1/3" />
        </AlertTitle>
        <AlertDescription>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </AlertDescription>
        </Alert>
      </div>

      {/* Main Content Skeleton */}
      <section className="py-12">
        <div className="container mx-auto px-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-8">
          <TabsTrigger value="recommended" className="text-sm md:text-base">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="text-sm md:text-base">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-20" />
          </TabsTrigger>
          </TabsList>

          {/* Recommended Listings Tab Skeleton */}
          <TabsContent value="recommended" className="space-y-8">
          <div>
            <Skeleton className="h-8 w-1/2 mb-6" /> {/* h2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-8 w-1/4" />
                </div>
              </CardContent>
              </Card>
            ))}
            </div>
            <div className="mt-8 text-center">
            <Skeleton className="h-10 w-36" /> {/* Button */}
            </div>
          </div>
          <div>
            <Skeleton className="h-8 w-1/2 mb-6" /> {/* h2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-8 w-1/4" />
                </div>
              </CardContent>
              </Card>
            ))}
            </div>
          </div>
          </TabsContent>

          {/* Admin Dashboard Tab Skeleton */}
          <TabsContent value="dashboard" className="space-y-8">
          <div>
            <Skeleton className="h-8 w-1/2 mb-6" /> {/* h2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-1/2" />
                </div>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              </Card>
            ))}
            </div>
            <Card className="md:col-span-3 mt-6">
            <CardHeader>
              <Skeleton className="h-7 w-1/3 mb-1" /> {/* CardTitle */}
              <Skeleton className="h-4 w-2/3" /> {/* CardDescription */}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
                <Skeleton className="h-8 w-1/3" />
                </div>
              ))}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-100 dark:bg-gray-800">
              <Skeleton className="h-10 w-full" /> {/* Button */}
            </CardFooter>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" /> {/* CardTitle */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-2/3 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                </div>
              ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" /> {/* Button */}
            </CardFooter>
            </Card>
            <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" /> {/* CardTitle */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                </div>
              ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" /> {/* Button */}
            </CardFooter>
            </Card>
          </div>
          </TabsContent>
        </Tabs>
        </div>
      </section>
      </main>
    </div>

  )
}
