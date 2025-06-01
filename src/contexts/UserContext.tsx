"use client"

import { getCurrentUser } from "@/features/auth/api/authApi"
import { getAuthToken } from "@/lib/cookies"
import type { User } from "@/types/api.types"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"


interface UserContextType {
  currentUser: User | null
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchUser = async () => {
    const token = getAuthToken()
    if(!token) {
      setCurrentUser(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (err: any) {
      console.error("Error fetching current user:", err)
      setError(err.message)
      setCurrentUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  useEffect(() => {
    fetchUser()
    
    // Listen for token changes in localStorage/cookies
    const handleStorageChange = () => {
      const token = getAuthToken()
      if (!token) {
        setCurrentUser(null)
        setLoading(false)
      } else {
        fetchUser()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return <UserContext.Provider value={{ currentUser, loading, error, refreshUser }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
