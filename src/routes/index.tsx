import { OAuthCallbackPage } from "@/features/auth/pages/OAuthCallbackPage"
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage"
import { ChatThread } from "@/features/messages/components/ChatThread"
import { MessagesPage } from "@/features/messages/components/MessagesPage"
import type React from "react"
import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { AddPropertyForm } from "../features/owner/components/AddPropertyForm"
import { AccessDeniedPage } from "../pages/AccessDeniedPage"
import { UserRole } from "../types/user.types"
import ProtectedRoute from "./protectedRoute"

// Lazy-loaded components
const SignupPage = lazy(() => import("../features/auth/pages/SignupPage"))
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"))
const ForgotPasswordPage = lazy(() => import("../features/auth/pages/ForgotPasswordPage"))
const LandingPage = lazy(() => import("../pages/LandingPage"))
const ListingDetailsPage = lazy(() => import("../pages/ListingDetailsPage"))
const BookingPage = lazy(() => import("../pages/BookingPage"))
const BookingDetailPage = lazy(() => import("../pages/BookingDetailPage"))

// Admin pages
const AdminDashboardPage = lazy(() => import("../features/admin/pages/DashboardPage"))
const AdminUsersPage = lazy(() => import("../features/admin/pages/UsersPage"))
const AdminUserDetailPage = lazy(() => import("../features/admin/pages/UserDetailPage"))
const AdminAllKycPage = lazy(() => import("../features/admin/pages/AllKycPage"))
const AdminListingsPage = lazy(() => import("../features/admin/pages/ListingsPage"))
const AdminListingDetailPage = lazy(() => import("../features/admin/pages/ListingDetailPage"))
const AdminCategoriesPage = lazy(() => import("../features/admin/pages/CategoriesPage"))
const AdminReportsPage = lazy(() => import("../features/admin/pages/ReportsPage"))
const AdminSettingsPage = lazy(() => import("../features/admin/pages/SettingsPage"))

// Tenant pages
const TenantProfilePage = lazy(() => import("../features/tenant/pages/TenantProfilePage"))
const TenantHomePage = lazy(() => import("../features/tenant/pages/TenantHomePage"))
// const TenantBookingsPage = lazy(() => import("../features/tenant/pages/RentalHistoryPage"))

// // Owner pages
const OwnerProfilePage = lazy(() => import("../features/owner/pages/OwnerProfilePage"))
const OwnerListingDetail = lazy(() => import("../features/owner/pages/OwnerListingDetail"))
const ManagePropertyPage = lazy(() => import("../features/owner/pages/ManageListingPage"))
// const OwnerBookingsPage = lazy(() => import("../features/owner/pages/BookingsPage"))
const HomePage = lazy(() => import("../pages/HomePage"))
const BrowsePage = lazy(() => import("../pages/BrowsePage"))
const AboutPage = lazy(() => import("../pages/About"))
const ContactPage = lazy(() => import("../pages/Contact"))
const TagSystemTestPage = lazy(() => import("../pages/TagSystemTestPage"))
// const DashboardPage = lazy(() => import("../pages/Dashboard/Dashboard"))
// We'll need to create a ListingDetailsPage component
// const ListingDetailsPage = lazy(() => import("../pages/ListingDetails"))

// Loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
)

// Role-specific route guards
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute requiredRole={UserRole.ADMIN}>{children}</ProtectedRoute>
}

const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute requiredRole={UserRole.PROPERTY_OWNER}>{children}</ProtectedRoute>
}

const TenantRoute = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute requiredRole={UserRole.TENANT}>{children}</ProtectedRoute>
}

// Permission-specific route guards
const BookingRoute = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute requiredPermission="can_book_properties">{children}</ProtectedRoute>
}

const ListingRoute = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute requiredPermission="can_list_properties">{children}</ProtectedRoute>
}

const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: "/browse",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <BrowsePage />
      </Suspense>
    ),
  },
  {
    path: "/about",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AboutPage />
      </Suspense>
    ),
  },  {
    path: "/contact",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ContactPage />
      </Suspense>
    ),
  },
  {
    path: "/tag-system-test",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TagSystemTestPage />
      </Suspense>
    ),
  },
  {
    path: "/listings/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ListingDetailsPage />
      </Suspense>
    ),
  },
  {
    path: "/access-denied",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AccessDeniedPage />
      </Suspense>
    ),
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SignupPage />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ForgotPasswordPage />
      </Suspense>
    ),
  },
  {
    path: "/verify-email/:userId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VerifyEmailPage />
      </Suspense>
    )
  },
  {
    path: "/oauth/:provider/callback",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <OAuthCallbackPage />
      </Suspense>
    )
  },
  // New route for handling direct token redirects:
  {
    path: "/auth/callback", // Or any other path you prefer e.g. /handle-token
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <OAuthCallbackPage />
      </Suspense>
    )
  },

  // Protected routes

  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <HomePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // {
  //   path: "/messages/:listingId/:receiverId",
  //   element: (
  //     <ProtectedRoute>
  //       <Suspense fallback={<LoadingFallback />}>
  //         <ChatPage />
  //       </Suspense>
  //     </ProtectedRoute>
  //   )
  // },
  {
    path: "messages",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <MessagesPage />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        path: ":listingId/:receiverId",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ChatThread />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Tenant-specific routes
  {
    path: "/tenant/profile",
    element: (
      <TenantRoute>
        <Suspense fallback={<LoadingFallback />}>
          <TenantProfilePage />
        </Suspense>
      </TenantRoute>
    ),
  },
  {
    path: "/tenant/home",
    element: (
      <TenantRoute>
        <Suspense fallback={<LoadingFallback />}>
          <TenantHomePage />
        </Suspense>
      </TenantRoute>
    ),
  },
  {
    path: "/tenant/bookings",
    element: (
      <TenantRoute>
        <Suspense fallback={<LoadingFallback />}>{/* <TenantBookingsPage /> */}</Suspense>
      </TenantRoute>
    ),
  },
  {
    path: "/listings/:id/book",
    element: (
      <BookingRoute>
        <Suspense fallback={<LoadingFallback />}>
          <BookingPage />
        </Suspense>
      </BookingRoute>
    ),
  },
  {
    path: "/listings/:listingId/bookings/:bookingId",
    element: (
      <BookingRoute>
        <Suspense fallback={<LoadingFallback />}>
          <BookingDetailPage />
        </Suspense>
      </BookingRoute>
    ),
  },

  // Owner-specific routes
  {
    path: "/owner/profile",
    element: (
      <OwnerRoute>
        <Suspense fallback={<LoadingFallback />}><OwnerProfilePage /></Suspense>
      </OwnerRoute>
    ),
  },
    {
    path: "/owner/listings/:id/manage",
    element: (
      <OwnerRoute>
        <Suspense fallback={<LoadingFallback />}><ManagePropertyPage /></Suspense>
      </OwnerRoute>
    ),
  },
  {
    path: "/owner/listings/:id",
    element: (
      <ListingRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AddPropertyForm />
        </Suspense>
      </ListingRoute>
    ),
  },


  // {
  //   path: "/owner/bookings",
  //   element: (
  //     <OwnerRoute>
  //       <Suspense fallback={<LoadingFallback />}><OwnerBookingsPage /></Suspense>
  //     </OwnerRoute>
  //   ),
  // },


  // Admin-specific routes
  {
    path: "/admin/dashboard",
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AdminDashboardPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AdminUsersPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: "/admin/listings",
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AdminListingsPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: "/admin/listings/:id",
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AdminListingDetailPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: "/admin/categories",
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AdminCategoriesPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: "/admin/reports",
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AdminReportsPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  // {
  //   path: "/admin/settings",
  //   element: (
  //     <AdminRoute>
  //       <Suspense fallback={<LoadingFallback />}>
  //         <AdminSettingsPage />
  //       </Suspense>
  //     </AdminRoute>
  //   ),
  // },
  {
    path: "/admin/profile",
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AdminUserDetailPage />
        </Suspense>
      </AdminRoute>
    )
  },
  {
  path: "/admin/users/:userId",
  element: (
      <AdminRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AdminUserDetailPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: "/admin/kyc-management", // Added
    element: ( // Added
      <AdminRoute> {/* Added */}
        <Suspense fallback={<LoadingFallback />}> {/* Added */}
          <AdminAllKycPage /> {/* Added */}
        </Suspense> {/* Added */}
      </AdminRoute> // Added
    ), // Added
  }, // Added

  // Fallback route
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])

export default function Routes() {
  return <RouterProvider router={router} />
}
