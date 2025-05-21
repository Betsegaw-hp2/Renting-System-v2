"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { cn } from "../../../lib/utils"

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = true,
  className,
}) => {
  const [activeInput, setActiveInput] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = Array(length).fill(null)
  }, [length])

  // Auto focus on first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  // Split value into array of characters
  const otpValues = value.split("").slice(0, length)
  while (otpValues.length < length) {
    otpValues.push("")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value

    // Only accept single digit numbers
    if (newValue === "" || /^[0-9]$/.test(newValue)) {
      const newOtpValues = [...otpValues]
      newOtpValues[index] = newValue

      // Update the value
      onChange(newOtpValues.join(""))

      // Move to next input if a digit was entered
      if (newValue !== "" && index < length - 1) {
        setActiveInput(index + 1)
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (otpValues[index] === "" && index > 0) {
        // If current input is empty, move to previous input
        setActiveInput(index - 1)
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current input
        const newOtpValues = [...otpValues]
        newOtpValues[index] = ""
        onChange(newOtpValues.join(""))
      }
    }
    // Handle arrow keys
    else if (e.key === "ArrowLeft" && index > 0) {
      setActiveInput(index - 1)
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      setActiveInput(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Only accept numbers
    if (/^[0-9]+$/.test(pastedData)) {
      // Take only the needed length
      const pastedOtp = pastedData.slice(0, length)
      onChange(pastedOtp)

      // Focus on the last input or the next empty one
      const focusIndex = Math.min(pastedOtp.length, length - 1)
      setActiveInput(focusIndex)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otpValues[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={() => setActiveInput(index)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-xl font-semibold rounded-md border-2 focus:border-primary focus:outline-none transition-all",
            {
              "border-gray-300 bg-white": !disabled,
              "border-gray-200 bg-gray-100": disabled,
              "border-primary": activeInput === index && !disabled,
            },
          )}
          aria-label={`Digit ${index + 1} of verification code`}
        />
      ))}
    </div>
  )
}
