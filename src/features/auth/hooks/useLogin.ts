"use client"

import type React from "react"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { validateEmail, validateRequired } from "../../../lib/validation"
import type { AppDispatch, RootState } from "../../../store"
import { loginUser } from "../slices/authSlice"

export const useLogin = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { is_loading, error } = useSelector((state: RootState) => state.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!validateRequired(email)) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!validateRequired(password)) {
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
      navigate("/home")
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
    isLoading: is_loading, // Map snake_case to camelCase for backward compatibility
    error,
    errors,
  }
}