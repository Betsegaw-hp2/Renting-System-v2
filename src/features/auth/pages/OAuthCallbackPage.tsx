// src/features/auth/pages/OAuthCallbackPage.tsx
"use client"

import apiClient from "@/api/client"
import { AuthLayout } from "@/components/layout/AuthLayout"
import apiConfig from "@/config/api.config"
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
        const queryParams = new URLSearchParams(search)
        const directToken = queryParams.get("token")

        if (directToken) {
          // Case 1: Token is directly in the URL query parameters
          setAuthToken(directToken, true)
          await dispatch(fetchCurrentUser()).unwrap()
          navigate("/home", { replace: true })
        } else {
          // Case 2: Token is not in URL, try to fetch it using provider
          // This requires 'provider' to be available from useParams
          // and 'search' to contain parameters for the backend API call (e.g. ?code=...)
          if (provider) {
            // Check if provider is available
            const resp = await apiClient.get<{ token: string }>(
              `${ apiConfig.dev ? import.meta.env.LOCAL_HOST : import.meta.env.VITE_API_PROD_BASE_URL}/oauth/${provider}/callback${search}`,
            //   { withCredentials: true }
            )
            const { token: fetchedToken } = resp.data // Use a different name
            setAuthToken(fetchedToken,  true)
            await dispatch(fetchCurrentUser()).unwrap()
            navigate("/home", { replace: true })
          } else {
            // Provider is not available, and token was not in URL. This is an invalid state.
            console.error("OAuth callback: No direct token in URL and no provider specified for API call.")
            navigate("/login", { replace: true, state: { error: "Authentication configuration error." } })
          }
        }
      } catch (err: any) {
        console.error("OAuth callback failed", err)
        const errorMessage =  err.response?.data.message || err.message || "An unknown error occurred during OAuth callback."
        navigate("/login", { replace: true, state: { error: errorMessage } })
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
