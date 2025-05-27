"use client"

import { AlertCircle, ArrowLeft, ArrowRight, ChevronRight, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { Button } from "../../../components/ui/button"
import { cn } from "../../../lib/utils"
import { UserRole } from "../../../types/user.types"
import { useMultiStepSignup } from "../hooks/useMultiStepSignup"
import { SIGNUP_STEPS } from "../types/signup.types"
import { AccountInfoStep } from "./signup/AccountInfoStep"
import { OtpVerificationStep } from "./signup/OtpVerficationStep"
import { OwnerDetailsStep } from "./signup/OwnerDetailsStep"
import { StepIndicator } from "./signup/StepIndicator"
import { TenantDetailsStep } from "./signup/TenantDetailsStep"

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
    skipAndCreateAccount,
    handleOtpVerified,
    registeredUserId,
  } = useMultiStepSignup()

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

  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Create an Account
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Join our rental community today</p>
      </div>

      <StepIndicator currentStep={currentStep} role={formData.role} />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {typeof error === "string" ? error : "An error occurred during signup. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-6">
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
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={skipAndCreateAccount}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  Skip and Create Account
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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

      <div className="mt-6 text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4">
          Log in
        </Link>
      </div>
    </div>
  )
}