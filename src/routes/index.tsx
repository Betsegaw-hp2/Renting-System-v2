import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import ProtectedRoute from "./protectedRoute"

// Lazy-loaded components
const SignupPage = lazy(() => import("../features/auth/pages/SignupPage"))
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"))
const ForgotPasswordPage = lazy(() => import("../features/auth/pages/ForgotPasswordPage"))
// const HomePage = lazy(() => import("../pages/Home"))
// const DashboardPage = lazy(() => import("../pages/Dashboard/Dashboard"))

// Loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
)

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        {/* <HomePage /> */}
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
        </Suspense>
      </ProtectedRoute>
    ),
  },
])

export default function Routes() {
  return <RouterProvider router={router} />
}
