import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { lazy, Suspense } from "react"
import ProtectedRoute from "./protectedRoute"

// Lazy-loaded components
const SignupPage = lazy(() => import("../features/auth/pages/SignupPage"))
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"))
const ForgotPasswordPage = lazy(() => import("../features/auth/pages/ForgotPasswordPage"))
const HomePage = lazy(() => import("../pages/Home"))
const BrowsePage = lazy(() => import("../pages/Browse"))
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
  // {
  //   path: "/dashboard",
  //   element: (
  //     <ProtectedRoute>
  //       <Suspense fallback={<LoadingFallback />}>
  //         <DashboardPage />
  //       </Suspense>
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path: "/browse",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <BrowsePage />
      </Suspense>
    ),
  },
  {
    path: "/listing/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        {/* We'll need to create this component */}
        {/* <ListingDetailsPage /> */}
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Listing Details</h1>
            <p className="text-gray-600">This page is under construction.</p>
          </div>
        </div>
      </Suspense>
    ),
  },
])

export default function Routes() {
  return <RouterProvider router={router} />
}
