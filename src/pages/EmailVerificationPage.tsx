import { useLocation, Navigate } from "react-router-dom"
import { EmailVerificationForm } from "../features/auth/components/EmailVerificationForm"
import { AuthLayout } from "../components/layout/AuthLayout"

export default function EmailVerificationPage() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const userId = queryParams.get("userId")
  const email = queryParams.get("email")

  // Redirect if no userId is provided
  if (!userId) {
    return <Navigate to="/login" replace />
  }

  const handleVerificationSuccess = () => {
    // Redirect to login page after successful verification
    window.location.href = "/login?verified=true"
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto py-8">
        <EmailVerificationForm
          userId={userId}
          userEmail={email || undefined}
          onVerificationSuccess={handleVerificationSuccess}
        />
      </div>
    </AuthLayout>
  )
}
