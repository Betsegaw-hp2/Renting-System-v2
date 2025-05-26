"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { updateEmail } from "../../api/authApi"

export function ChangeEmailModal({
  userId,
  currentEmail,
  onClose,
  onEmailUpdated,
}: {
  userId: string
  currentEmail: string
  onClose: () => void
  onEmailUpdated: (newEmail: string) => void
}) {
  const [newEmail, setNewEmail] = useState(currentEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const handleSave = async () => {
    setLoading(true); setError(null)
    try {
      await updateEmail(userId, newEmail.trim())
      onEmailUpdated(newEmail.trim())
    } catch (e: any) {
      setError(e.message ?? "Failed to update email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80">
        <h4 className="text-lg font-semibold mb-4">Change Email</h4>
        <Input
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder="New email"
          className="w-full mb-4"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !newEmail.trim()}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
