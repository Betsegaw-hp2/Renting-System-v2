import type React from "react"
import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { PropertyListingForm } from "../features/owner/components/PropertyListingForm"
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
const AdminListingsPage = lazy(() => import("../features/admin/pages/ListingsPage"))
const AdminCategoriesPage = lazy(() => import("../features/admin/pages/CategoriesPage"))
const AdminReportsPage = lazy(() => import("../features/admin/pages/ReportsPage"))
const AdminSettingsPage = lazy(() => import("../features/admin/pages/SettingsPage"))

// Tenant pages
const TenantProfilePage = lazy(() => import("../features/tenant/pages/TenantProfilePage"))
const TenantHomePage = lazy(() => import("../features/tenant/pages/TenantHomePage"))
// const TenantBookingsPage = lazy(() => import("../features/tenant/pages/RentalHistoryPage"))

// // Owner pages
// const OwnerListingsPage = lazy(() => import("../features/owner/pages/ListingsPage"))
// const OwnerBookingsPage = lazy(() => import("../features/owner/pages/BookingsPage"))
const HomePage = lazy(() => import("../pages/HomePage"))
const BrowsePage = lazy(() => import("../pages/BrowsePage"))
const AboutPage = lazy(() => import("../pages/About"))
const ContactPage = lazy(() => import("../pages/Contact"))
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
  },
  {
    path: "/contact",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ContactPage />
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
    path: "/owner/listings",
    element: (
      <OwnerRoute>
        <Suspense fallback={<LoadingFallback />}>{/* <OwnerListingsPage /> */}</Suspense>
      </OwnerRoute>
    ),
  },
  {
    path: "/owner/listings/new",
    element: (
      <ListingRoute>
        <Suspense fallback={<LoadingFallback />}>
          <PropertyListingForm />
        </Suspense>
      </ListingRoute>
    ),
  },
  {
    path: "/owner/bookings",
    element: (
      <OwnerRoute>
        <Suspense fallback={<LoadingFallback />}>{/* <OwnerBookingsPage /> */}</Suspense>
      </OwnerRoute>
    ),
  },

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
  {
    path: "/admin/settings",
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AdminSettingsPage />
        </Suspense>
      </AdminRoute>
    ),
  },

  // Fallback route
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])

export default function Routes() {
  return <RouterProvider router={router} />
}
