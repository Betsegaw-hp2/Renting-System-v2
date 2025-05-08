import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import ProtectedRoute from "./protectedRoute"

// Lazy-loaded components
const SignupPage = lazy(() => import("../features/auth/pages/SignupPage"))
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"))
const ForgotPasswordPage = lazy(() => import("../features/auth/pages/ForgotPasswordPage"))
const HomePage = lazy(() => import("../pages/Home"))
// const DashboardPage = lazy(() => import("../pages/Dashboard/Dashboard"))


// Admin pages
const AdminDashboardPage = lazy(() => import("../features/admin/pages/DashboardPage"))
const AdminUsersPage = lazy(() => import("../features/admin/pages/UsersPage"))
const AdminListingsPage = lazy(() => import("../features/admin/pages/ListingsPage"))
const AdminCategoriesPage = lazy(() => import("../features/admin/pages/CategoriesPage"))
const AdminReportsPage = lazy(() => import("../features/admin/pages/ReportsPage"))

// Loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
)

// Admin route guard
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  // return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
  return <ProtectedRoute>{children}</ProtectedRoute>
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <HomePage />
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
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          {/* <DashboardPage /> */}
          <h1>Dashboard</h1>
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/browse",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <HomePage />
      </Suspense>
    ),
  },
   // Admin routes
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
])

export default function Routes() {
  return <RouterProvider router={router} />
}
