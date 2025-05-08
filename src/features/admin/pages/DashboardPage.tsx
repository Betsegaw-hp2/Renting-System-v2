"use client"

import { ArrowDownRight, ArrowUpRight, BarChart3, Flag, FolderTree, Home, TrendingUp, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { adminApi } from "../api/adminApi"
import { AdminLayout } from "../components/layout/AdminLayout"
import type { AdminDashboardStats } from "../types"

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      description: `${stats?.newUsersThisMonth || 0} new this month`,
      icon: Users,
      trend: 12,
      trendUp: true,
    },
    {
      title: "Total Listings",
      value: stats?.totalListings || 0,
      description: `${stats?.newListingsThisMonth || 0} new this month`,
      icon: Home,
      trend: 8,
      trendUp: true,
    },
    {
      title: "Active Listings",
      value: stats?.activeListings || 0,
      description: "Currently active",
      icon: TrendingUp,
      trend: 5,
      trendUp: true,
    },
    {
      title: "Categories",
      value: stats?.totalCategories || 0,
      description: "Total categories",
      icon: FolderTree,
      trend: 0,
      trendUp: true,
    },
    {
      title: "Total Reports",
      value: stats?.totalReports || 0,
      description: `${stats?.pendingReports || 0} pending reports`,
      icon: Flag,
      trend: 3,
      trendUp: false,
    },
  ]

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
                  ) : (
                    card.value.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
                {card.trend > 0 && (
                  <div className="mt-2 flex items-center text-xs">
                    {card.trendUp ? (
                      <>
                        <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500">{card.trend}% increase</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                        <span className="text-red-500">{card.trend}% decrease</span>
                      </>
                    )}
                    <span className="ml-1 text-muted-foreground">from last month</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Platform activity for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <BarChart3 className="h-8 w-8 text-muted" />
                <span className="ml-2 text-muted-foreground">Chart will be displayed here</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-muted"></div>
                        <div className="space-y-1.5">
                          <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                          <div className="h-3 w-24 animate-pulse rounded bg-muted"></div>
                        </div>
                      </div>
                    ))
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Home className="h-5 w-5 text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">New listing created</p>
                        <p className="text-xs text-muted-foreground">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Flag className="h-5 w-5 text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">New report submitted</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <FolderTree className="h-5 w-5 text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">Category updated</p>
                        <p className="text-xs text-muted-foreground">3 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">User profile updated</p>
                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
