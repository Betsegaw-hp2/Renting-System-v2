"use client"

import type React from "react"

import { unwrapResult } from "@reduxjs/toolkit"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { useToast } from "../../../hooks/useToast"
import { validateEmail, validateRequired } from "../../../lib/validation"
import type { AppDispatch, RootState } from "../../../store"
import { loginUser } from "../slices/authSlice"

export const useLogin = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { is_loading, error } = useSelector((state: RootState) => state.auth)
  const [showPassword, setShowPassword] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle email verification success
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const isVerified = urlParams.get('verified')
    const emailParam = urlParams.get('email')
    
    if (isVerified === 'true') {
      toast({
        title: "Email verified successfully!",
        description: "Please log in to continue.",
      })
      
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam))
      }
    }
  }, [location.search, toast])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!validateRequired(email)) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }    if (!validateRequired(password)) {
      newErrors.password = "Password is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const resultAction = await dispatch(loginUser({ email, password, remember_me: rememberMe }))

    if (loginUser.fulfilled.match(resultAction)) {
      try {
        const loginResponse = unwrapResult(resultAction)
        
        if (!loginResponse?.is_verified) {
          return navigate(`/verify-email/${loginResponse.id}`)
        } else if (loginResponse) {
          // Check if this is a post-signup verification login
          const isPostSignupVerification = sessionStorage.getItem('triggerTagPromptAfterSignup') === 'true'
          
          // Determine if user needs tag prompt
          const needsTagPrompt = !loginResponse.tags || loginResponse.tags.length === 0
          
          if (needsTagPrompt || isPostSignupVerification) {
            // Set tag prompt flag for regular login or post-signup
            sessionStorage.setItem('triggerTagPromptAfterLogin', 'true')
            sessionStorage.removeItem('skippedTagPrompt')
          } else {
            sessionStorage.removeItem('triggerTagPromptAfterLogin')
          }
          
          // Clean up verification flags
          sessionStorage.removeItem('emailJustVerified')
          sessionStorage.removeItem('verifiedUserEmail')
          sessionStorage.removeItem('triggerTagPromptAfterSignup')
          
          // Navigate to home with a small delay to ensure state updates
          setTimeout(() => {
            navigate("/home")
          }, 300)
          return
        }
      } catch (e) {
        console.error("Login failed or bad payload:", e)
      }
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    handleSubmit,
    showPassword,
    setShowPassword,
    isLoading: is_loading, // Map snake_case to camelCase for backward compatibility
    error,
    errors,
  }
}