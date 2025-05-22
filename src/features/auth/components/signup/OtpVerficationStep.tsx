"use client"

import { useToast } from "@/hooks/useToast"
import { useEffect, useRef, useState } from "react"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { resendVerifyEmail, updateEmail, verifyEmail } from "../../api/authApi"

interface OtpVerificationStepProps {
	userId: string
	email: string
	onVerified: () => void
	onEmailChange: (newEmail: string) => void
}

export function OtpVerificationStep({
	userId,
	email,
	onVerified,
	onEmailChange,
}: OtpVerificationStepProps) {
	const CODE_LENGTH = 6
	const [codes, setCodes] = useState<string[]>(Array(CODE_LENGTH).fill(""))
	const [activeIndex, setActiveIndex] = useState(0)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [showModal, setShowModal] = useState(false)
	const [newEmail, setNewEmail] = useState(email)
	const inputsRef = useRef<Array<HTMLInputElement | null>>([])
	const { toast } = useToast()

	useEffect(() => {
		inputsRef.current[activeIndex]?.focus()
	}, [activeIndex])

	// Open change-email modal
	const openModal = () => {
		setNewEmail(email)
		setShowModal(true)
	}

	const closeModal = () => {
		setShowModal(false)
		setError(null)
		setCodes(Array(CODE_LENGTH).fill(""))
		setActiveIndex(0)
	}

	// Handle email update API call, triggers new OTP
	const handleEmailSubmit = async () => {
		if (!newEmail.trim()) return
		setLoading(true)
		setError(null)
		try {
			await updateEmail(userId, newEmail.trim())
			onEmailChange(newEmail.trim())
			toast({ title: "Email updated", description: "We sent a new code to your updated email.", duration: 3000 })
			closeModal()
		} catch (err: any) {
			setError((err.response?.data?.message || err.message) ?? "Failed to update email.")
		} finally {
			setLoading(false)
		}
	}

	const handleChange = (value: string, idx: number) => {
		if (/^[0-9]?$/.test(value)) {
			const newCodes = [...codes]
			newCodes[idx] = value
			setCodes(newCodes)
			if (value && idx < CODE_LENGTH - 1) {
				setActiveIndex(idx + 1)
			}
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
		if (e.key === "Backspace" && !codes[idx] && idx > 0) {
			setActiveIndex(idx - 1)
		}
	}

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault()
		const pasteData = e.clipboardData.getData("Text")
		if (/^\d+$/.test(pasteData)) {
			const pasteDigits = pasteData.split("").slice(0, CODE_LENGTH)
			setCodes(pasteDigits)
			setActiveIndex(Math.min(pasteDigits.length, CODE_LENGTH - 1))
		}
	}

	const handleVerify = async () => {
		const otp = codes.join("")
		if (otp.length !== CODE_LENGTH) {
			setError("Please enter the full code")
			return
		}
		setLoading(true)
		setError(null)
		try {
			await verifyEmail({ user_id: userId, otp_code: otp })
			onVerified()
		} catch (err: any) {
			console.error(err)
			setError((err.response?.data?.message || err.message) ?? "Unexpected error happened, please try again.")
		} finally {
			setLoading(false)
		}
	}

	const handleResend = async () => {
		setLoading(true)
		setError(null)
		try {
			await resendVerifyEmail(userId)
			setCodes(Array(CODE_LENGTH).fill(""))
			setActiveIndex(0)
			toast({ title: "Code resent", description: "A new code has been sent.", duration: 3000 })
		} catch (err: any) {
			setError((err.response?.data?.message || err.message) ?? "Failed to resend code.")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="relative">
			<div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6 text-center">
				<h3 className="text-2xl font-semibold">Verify Your Email</h3>
				<p className="text-gray-500 dark:text-gray-400">
					We sent a code to <span className="font-medium">{email}</span>
				</p>

				<div className="flex justify-center space-x-2">
					{codes.map((digit, idx) => (
						<input
							key={idx}
							ref={el => (inputsRef.current[idx] = el)}
							type="text"
							inputMode="numeric"
							maxLength={1}
							value={digit}
							onChange={e => handleChange(e.target.value, idx)}
							onKeyDown={e => handleKeyDown(e, idx)}
							onPaste={handlePaste}
							className="h-12 w-12 border rounded-lg text-center text-xl font-mono focus:border-blue-500 focus:ring focus:ring-blue-200"
						/>
					))}
				</div>

				{error && <p className="text-red-500 text-sm">{error}</p>}

				<Button onClick={handleVerify} disabled={loading} className="w-full">
					{loading ? "Verifying…" : "Confirm"}
				</Button>

				<div className="flex justify-between text-sm">
					<button onClick={openModal} disabled={loading} className="underline">
						Change email
					</button>
					<button onClick={handleResend} disabled={loading} className="underline">
						Resend code
					</button>
				</div>
			</div>

			{/* Change Email Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-80">
						<h4 className="text-lg font-semibold mb-4">Update Email</h4>
						<Input
							value={newEmail}
							onChange={e => setNewEmail(e.target.value)}
							placeholder="Enter new email"
							className="w-full mb-4"
						/>
						<div className="flex justify-end space-x-2">
							<Button variant="outline" onClick={closeModal} disabled={loading}>Cancel</Button>
							<Button onClick={handleEmailSubmit} disabled={loading || !newEmail.trim()}>Save</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
