"use client"

import { AlertCircle, ArrowLeft, ArrowRight, Briefcase, Loader2, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { cn } from "../../../lib/utils";
import { UserRole, UserRole as UserRolesEnum } from "../../../types/user.types";
import { useMultiStepSignup } from "../hooks/useMultiStepSignup";
import { SIGNUP_STEPS } from "../types/signup.types";
import { AccountInfoStep } from "./signup/AccountInfoStep";
import { OtpVerificationStep } from "./signup/OtpVerficationStep";
import { OwnerDetailsStep } from "./signup/OwnerDetailsStep";
import { StepIndicator } from "./signup/StepIndicator";
import { TenantDetailsStep } from "./signup/TenantDetailsStep";

const API_BASE = import.meta.env.VITE_API_PROD_BASE_URL 

export function SignupForm() {
  const {
    currentStep,
    formData,
    errors,
    isLoading,
    error,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    handleSubmit,
    handleOtpVerified,
    registeredUserId,
  } = useMultiStepSignup()

  const [oauthSelectedRole, setOauthSelectedRole] = useState<UserRole | "">("")
  const [showOauthRoleErrorDialog, setShowOauthRoleErrorDialog] = useState(false)

  const handleOauthSignup = (provider: string) => {
    if (!oauthSelectedRole) {
      setShowOauthRoleErrorDialog(true)
      return
    }
    window.location.href = `${API_BASE}/oauth/${provider}?role=${oauthSelectedRole}`
  }

  // Render OTP step exclusively
  if (currentStep === "verify-email" && registeredUserId) {
    return (
      <div className="w-full max-w-md mx-auto">
        <StepIndicator currentStep={currentStep} role={formData.role} />
        <OtpVerificationStep
          userId={registeredUserId}
          email={formData.email}
          onVerified={handleOtpVerified}
        />
      </div>
    )
  }
  console.log("error in SignupForm.tsx: ", error)

  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Create an Account
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Join our rental community today</p>
      </div>

      {/* Global error for multi-step form */}
      {error && currentStep !== "verify-email" && ( // Ensure error is not shown on OTP exclusive page if it's a general error
        <Alert variant="destructive" className="my-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {typeof error === "string" ? error : "An unexpected error occurred. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {/* OAuth Signup Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md dark:border-gray-800 dark:bg-gray-950 mb-8 mt-6">
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold">Sign up with Google</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="oauth-role-signup" className="text-sm font-medium">
              Sign up as
            </Label>
            <Select value={oauthSelectedRole} onValueChange={(value) => setOauthSelectedRole(value as UserRole)}>
              <SelectTrigger id="oauth-role-signup" className="w-full mt-1">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRolesEnum.TENANT}>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Renter
                  </div>
                </SelectItem>
                <SelectItem value={UserRolesEnum.PROPERTY_OWNER}>
                  <div className="flex items-center">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Property Owner
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            type="button"
            onClick={() => handleOauthSignup("google")}
            disabled={isLoading || !oauthSelectedRole}
            className="w-full flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </Button>
        </div>
      </div>

      <Dialog open={showOauthRoleErrorDialog} onOpenChange={setShowOauthRoleErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Role Selection Required</DialogTitle>
            <DialogDescription>
              Please select a role (Renter or Property Owner) before signing up with Google.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowOauthRoleErrorDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Divider: "Or use your email" */}
      <div className="my-8 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
            Or use your email
          </span>
        </div>
      </div>
      
      {/* Email/Password Multi-step Form Section */}
      {currentStep !== "verify-email" && ( // Hide this section if on OTP verification step
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md dark:border-gray-800 dark:bg-gray-950">
          <StepIndicator currentStep={currentStep} role={formData.role} />
          <div className="mb-6 mt-4"> {/* Added mt-4 for spacing after StepIndicator */}
            <h2 className="text-xl font-semibold">{SIGNUP_STEPS[currentStep].title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{SIGNUP_STEPS[currentStep].description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Info */}
            <div className={cn("transition-all duration-300", currentStep !== "account" && "hidden")}>  
              <AccountInfoStep formData={formData} errors={errors} updateFormData={updateFormData} />
            </div>

            {/* Tenant Details */}
            <div className={cn("transition-all duration-300", currentStep !== "tenant-details" && "hidden")}>  
              {formData.role === UserRole.TENANT && (
                <TenantDetailsStep formData={formData} errors={errors} updateFormData={updateFormData} />
              )}
            </div>

            {/* Owner Details */}
            <div className={cn("transition-all duration-300", currentStep !== "owner-details" && "hidden")}>  
              {formData.role === UserRole.PROPERTY_OWNER && (
                <OwnerDetailsStep formData={formData} errors={errors} updateFormData={updateFormData} />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              {/* Back Button */}
              {currentStep !== "account" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}

              {/* Next/Submit Buttons */}
              {currentStep === "account" ? (
                <Button type="button" onClick={goToNextStep} disabled={isLoading} className="flex items-center gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-3 justify-end w-full"> {/* Ensure button is on the right like others */}
                  <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>
      )} {/* Closing tag for currentStep !== "verify-email" conditional rendering */}

      {/* "Already have an account?" Link */}
      {currentStep !== "verify-email" && ( // Also hide this if on OTP page
        <div className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4">
            Log in
          </Link>
        </div>
      )}
    </div>
  )
}