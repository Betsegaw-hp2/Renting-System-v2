// auth/components/modals/LoginModal.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { login as loginUser } from "../../api/authApi"

export function LoginModal({
  initialEmail,
  onClose,
  onSuccess,
}: {
  initialEmail: string
  onClose: () => void
  onSuccess: (token: string) => void
}) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true); setError(null)
    try {
      const resp = await loginUser({ email, password })
      onSuccess(resp.token)
    } catch (e: any) {
      setError(e.message ?? "Login failed")
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl space-y-4 w-80">
        <h4 className="text-lg font-semibold">Log In to Change Email</h4>
        <Input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
        />
        <Input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading || !password}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </div>
      </div>
    </div>
  )
}
