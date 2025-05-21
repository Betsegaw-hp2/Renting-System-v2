"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { OtpInput } from "./OtpInput"
import { verifyEmail, resendVerificationEmail } from "../api/authApi"
import { useToast } from "../../../hooks/useToast"
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface EmailVerificationFormProps {
  userId: string
  onVerificationSuccess?: () => void
  userEmail?: string
}

type VerificationStatus = "idle" | "verifying" | "success" | "error"

export const EmailVerificationForm: React.FC<EmailVerificationFormProps> = ({
  userId,
  onVerificationSuccess,
  userEmail,
}) => {
  const [otpCode, setOtpCode] = useState("")
  const [status, setStatus] = useState<VerificationStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [resendDisabled, setResendDisabled] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const { toast } = useToast()

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false)
    }
  }, [resendCountdown, resendDisabled])

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit verification code")
      return
    }

    setStatus("verifying")
    setErrorMessage("")

    try {
      const response = await verifyEmail({ otp_code: otpCode, user_id: userId })

      if (response.verified) {
        setStatus("success")
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified.",
          variant: "default",
        })

        // Call the success callback if provided
        if (onVerificationSuccess) {
          setTimeout(() => {
            onVerificationSuccess()
          }, 2000)
        }
      } else {
        setStatus("error")
        setErrorMessage("Verification failed. Please try again with a valid code.")
      }
    } catch (error) {
      setStatus("error")
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.")
      }
    }
  }

  const handleResendCode = async () => {
    setResendDisabled(true)
    setResendCountdown(60) // 60 seconds cooldown

    try {
      const response = await resendVerificationEmail(userId)
      toast({
        title: "Verification Code Sent",
        description: response.message || "A new verification code has been sent to your email.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Failed to Resend Code",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
      // Reset the countdown if there's an error
      setResendDisabled(false)
      setResendCountdown(0)
    }
  }

  const maskedEmail = userEmail
    ? userEmail.replace(/^(.{2})(.*)(@.*)$/, (_, start, middle, end) => start + middle.replace(/./g, "*") + end)
    : "your email"

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit verification code to {maskedEmail}. Enter the code below to verify your email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <OtpInput
            value={otpCode}
            onChange={setOtpCode}
            disabled={status === "verifying" || status === "success"}
            autoFocus
          />

          {status === "error" && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm">Email verified successfully!</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          onClick={handleVerify}
          disabled={otpCode.length !== 6 || status === "verifying" || status === "success"}
          className="w-full"
        >
          {status === "verifying" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Didn't receive the code? </span>
          {resendDisabled ? (
            <span className="text-primary">Resend in {resendCountdown}s</span>
          ) : (
            <button
              onClick={handleResendCode}
              className="text-primary hover:underline focus:outline-none"
              disabled={resendDisabled || status === "success"}
            >
              Resend Code
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
