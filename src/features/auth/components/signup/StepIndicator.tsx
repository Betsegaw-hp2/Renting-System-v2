import { CheckCircle2 } from "lucide-react"
import { cn } from "../../../../lib/utils"
import { UserRole } from "../../../../types/user.types"
import { SIGNUP_STEPS, type SignupStep } from "../../types/signup.types"

interface StepIndicatorProps {
  currentStep: SignupStep
  role: UserRole
}

export function StepIndicator({ currentStep, role }: StepIndicatorProps) {
  const steps: SignupStep[] = [
    "account",
    // role === UserRole.TENANT ? "tenant-details" : "owner-details",
    "verify-email",
  ]
  const currentIndex = steps.indexOf(currentStep)
  const totalSegments = steps.length - 1
  const offset = 20 // half circle diameter

  // Available width for lines: 100% minus both offsets
  const availableWidthCalc = `calc(100% - ${offset * 2}px)`
  const completedWidthCalc = `calc(${availableWidthCalc} * ${currentIndex}/${totalSegments})`

  return (
    <div className="mb-14">
      <div className="relative h-10">
        {/* Base line from first to last circle */}
        <div
          className="absolute top-1/2 h-0.5 bg-gray-300 transform -translate-y-1/2"
          style={{ left: `${offset}px`, right: `${offset}px` }}
        />

        {/* Progress line */}
        <div
          className="absolute top-1/2 h-0.5 bg-blue-600 transform -translate-y-1/2 transition-all duration-500"
          style={{ left: `${offset}px`, width: completedWidthCalc }}
        />

        {/* Circles and labels */}
        <div className="relative flex justify-between px-0">
          {steps.map((step, idx) => {
            const isDone = idx < currentIndex
            const isActive = idx === currentIndex
            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isDone
                      ? "border-blue-600 bg-blue-600 text-white"
                      : isActive
                        ? "border-blue-600 bg-white text-blue-600"
                        : "border-gray-300 bg-white text-gray-300"
                  )}
                >
                  {isDone ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-medium">{idx + 1}</span>}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs text-center w-20",
                    isActive ? "text-blue-600 font-semibold" : "text-gray-400"
                  )}
                >
                  {SIGNUP_STEPS[step].title}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}