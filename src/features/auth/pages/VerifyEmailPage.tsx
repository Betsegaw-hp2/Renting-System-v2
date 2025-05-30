"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
import type { RootState } from "@/store"
import { useSelector } from "react-redux"
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import { OtpVerificationStep } from "../components/signup/OtpVerficationStep"

export function VerifyEmailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  // const { currentUser } = useUser() 
  const reduxUser = useSelector((s: RootState) => s.auth.user)
  
 
  const signupEmail = (location.state as any)?.email as string | undefined
  
  const loginEmail = reduxUser?.email
  
  // Choose in priority order:
  const email = signupEmail ?? loginEmail

  if (!userId || !email) {
    return <Navigate to="/signup" replace />
  }

  return (
    <AuthLayout>
      <OtpVerificationStep
        userId={userId}
        email={email}
        onVerified={() => navigate("/login", { replace: true, state: { from: location } })}
      />
    </AuthLayout>
  )
}
