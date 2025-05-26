// src/features/auth/pages/OAuthCallbackPage.tsx
"use client"

import apiClient from "@/api/client"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { setAuthToken } from "@/lib/cookies"
import type { AppDispatch } from "@/store"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { fetchCurrentUser } from "../slices/authSlice"

export function OAuthCallbackPage() {
  const { provider } = useParams<{ provider: string }>()
  const { search } = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        // The backend’s /oauth/{provider}/callback will eventually redirect
        // back to this URL with query params (e.g. ?code=… or ?token=…)
        // Fetch it server-side to exchange for your JWT:
        const resp = await apiClient.get<{ token: string }>(
          `${import.meta.env.VITE_API_PROD_BASE_URL}/oauth/${provider}/callback${search}`,
        //   { withCredentials: true }
        )
        const { token } = resp.data
        setAuthToken(token,  true)
        await dispatch(fetchCurrentUser()).unwrap()
        navigate("/home", { replace: true })
      } catch (err) {
        console.error("OAuth callback failed", err)
        navigate("/login", { replace: true })
      }
    })()
  }, [provider, search, dispatch, navigate])

  return (
	<AuthLayout>
		<div className="flex h-screen items-center justify-center">
		<p>Finishing sign-in with {provider}…</p>
		</div>
	</AuthLayout>
  )
}
