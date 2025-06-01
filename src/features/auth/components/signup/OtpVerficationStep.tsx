"use client"

import { useToast } from "@/hooks/useToast"
import { setAuthToken } from "@/lib/cookies"
import { useEffect, useRef, useState } from "react"
import { Button } from "../../../../components/ui/button"
import { verifyEmail } from "../../api/authApi"
import { ChangeEmailModal } from "../modals/ChangeEmailModal"
import { LoginModal } from "../modals/LoginModal"

export function OtpVerificationStep({ userId, email, onVerified }: {
  userId: string
  email: string
  onVerified: () => void
}) {
  const CODE_LENGTH = 6
  const [codes, setCodes] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [activeIndex, setActiveIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showChangeEmail, setShowChangeEmail] = useState(false)
  const [currentEmail, setCurrentEmail] = useState(email) // Track current email locally
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const { toast } = useToast()

  // Update local email state when prop changes
  useEffect(() => {
    setCurrentEmail(email)
  }, [email])
  useEffect(() => {
    inputsRef.current[activeIndex]?.focus()
  }, [activeIndex])
  
  const handleVerify = async () => {
    const otp = codes.join("")
    if (otp.length < CODE_LENGTH) {
      setError("Enter full code")
      return
    }
    setLoading(true)
    setError(null)
    try {
      await verifyEmail({ user_id: userId, otp_code: otp })
      
      // Store verification success info for login page
      sessionStorage.setItem('emailJustVerified', 'true')
      sessionStorage.setItem('verifiedUserEmail', email)
      sessionStorage.setItem('triggerTagPromptAfterSignup', 'true')
      
      // Show success message and redirect to login
      toast({
        title: "Email verified successfully!",
        description: "Please log in to continue.",
        variant: "default"
      })
      
      // Redirect to login page instead of calling onVerified()
      setTimeout(() => {
        window.location.href = `/login?verified=true&email=${encodeURIComponent(email)}`
      }, 2000)
      
    } catch (e: any) {
      setError(e.response.data.message || e.message || "Invalid code")
    } finally {
      setLoading(false)
    }
  }

  function openEmailChangeModal() {
    setShowChangeEmail(true)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const paste = e.clipboardData.getData("Text").trim().slice(0, CODE_LENGTH).split("")
    const newCodes = Array(CODE_LENGTH).fill("")
    paste.forEach((ch, i) => {
      if (/^[0-9]$/.test(ch)) newCodes[i] = ch
    })
    setCodes(newCodes)
    const nextEmpty = newCodes.findIndex(c => c === "")
    setActiveIndex(nextEmpty === -1 ? CODE_LENGTH - 1 : nextEmpty)
  }

  return (    <div className="max-w-md mx-auto p-6 space-y-6 bg-white rounded-xl shadow-md text-center">
      <h3 className="text-2xl font-semibold">Verify Your Email</h3>
      <p className="text-sm text-gray-500">
        We sent a code to <strong>{currentEmail}</strong>.
      </p>

      {/* six 1-char inputs with paste support */}
      <div className="flex justify-center space-x-2" onPaste={handlePaste}>
        {codes.map((digit, idx) => (
          <input
            key={idx}
            ref={el => (inputsRef.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => {
              const val = e.target.value
              if (/^[0-9]?$/.test(val)) {
                const next = [...codes]
                next[idx] = val
                setCodes(next)
                if (val && idx < CODE_LENGTH - 1) setActiveIndex(idx + 1)
              }
            }}
            onKeyDown={e => {
              if (e.key === "Backspace" && !codes[idx] && idx > 0) setActiveIndex(idx - 1)
            }}
            className="w-12 h-12 border rounded-lg text-center text-xl font-mono focus:ring"
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button onClick={handleVerify} disabled={loading} className="w-full">
        {loading ? "Verifying…" : "Confirm"}
      </Button>

      <div className="text-xs text-gray-500">
        Mistyped your email?{' '}
        <button
          onClick={() => setShowLogin(true)}
          className="underline"
          disabled={loading}
        >
          Log in to update it
        </button>
      </div>      {/* Login modal */}
      {showLogin && (
        <LoginModal
          initialEmail={currentEmail}
          onClose={() => setShowLogin(false)}
          onSuccess={token => {
            setShowLogin(false)
            setAuthToken(token, false)
            openEmailChangeModal()
          }}
        />
      )}

      {/* Change Email modal */}
      {showChangeEmail && (
        <ChangeEmailModal
          userId={userId}
          currentEmail={currentEmail}
          onClose={() => setShowChangeEmail(false)}
          onEmailUpdated={newEmail => {
            setShowChangeEmail(false)
            setCurrentEmail(newEmail) // Update the local email state
            toast({ title: "Email changed", description: "Code resent to new address." })
            setCodes(Array(CODE_LENGTH).fill(""))
            setActiveIndex(0)
          }}
        />
      )}
    </div>
  )
}
