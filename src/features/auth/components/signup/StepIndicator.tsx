import { CheckCircle2 } from "lucide-react"
import { cn } from "../../../../lib/utils"
import { UserRole } from "../../../../types/user.types"
import { SIGNUP_STEPS, type SignupStep } from "../../types/signup.types"

interface StepIndicatorProps {
  currentStep: SignupStep
  role: UserRole
}

export function StepIndicator({ currentStep, role }: StepIndicatorProps) {
  // Determine which steps to show based on the selected role
  const steps: SignupStep[] = ["account"]

  if (role === UserRole.TENANT) {
    steps.push("tenant-details")
  } else {
    steps.push("owner-details")
  }

  const currentStepIndex = steps.indexOf(currentStep)
  const totalSteps = steps.length

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div key={step} className="flex items-center">
              {/* Step circle */}
              <div
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200",
                  isCompleted
                    ? "border-blue-600 bg-blue-600 text-white"
                    : isCurrent
                      ? "border-blue-600 text-blue-600"
                      : "border-gray-300 text-gray-300",
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <span className="text-lg font-semibold">{index + 1}</span>
                )}
                {isCurrent && (
                  <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-600"></span>
                )}
              </div>

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "h-1 w-24 transition-all duration-500",
                    index < currentStepIndex ? "bg-blue-600" : "bg-gray-300",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step labels */}
      <div className="mt-4 flex justify-between px-6">
        {steps.map((step, index) => (
          <div
            key={`label-${step}`}
            className={cn(
              "text-center transition-colors duration-200",
              index <= currentStepIndex ? "text-blue-600 font-medium" : "text-gray-400",
            )}
          >
            {SIGNUP_STEPS[step].title}
          </div>
        ))}
      </div>
    </div>
  )
}
