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
        
        console.log("OAuthCallbackPage: provider =", provider, "search =", search, "directToken =", directToken)
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
        console.error("OAuth callback failed: ", err)
        const errorMessage =  err.response?.data.message || err.message || "An unknown error occurred during OAuth callback."
        navigate("/login", { replace: true, state: { error: errorMessage } })
      }
    })()
  }, [provider, search, dispatch, navigate])

  return (
	<AuthLayout>
    <div className="flex h-screen flex-col items-center justify-center space-y-8 bg-background p-4 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
      <div className="absolute h-full w-full animate-spin rounded-full border-4 border-dashed border-primary opacity-75"></div>
      <div className="h-8 w-8 animate-ping rounded-full bg-primary opacity-75"></div>
      <div className="absolute h-5 w-5 rounded-full bg-primary"></div>
      </div>

      <div className="space-y-2">
      <p className="text-2xl font-bold tracking-tight text-foreground">
      Authenticating with {provider}...
      </p>
      <p className="text-md text-muted-foreground">
      Please wait while we securely connect your account.
      </p>
      <p className="pt-4 text-xs text-muted-foreground/80">
      This should only take a moment.
      </p>
      </div>
    </div>
	</AuthLayout>
  )
}
