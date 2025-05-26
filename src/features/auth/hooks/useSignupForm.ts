"use client"

import type React from "react"

import { unwrapResult } from "@reduxjs/toolkit"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { validateSignupForm, type ValidationError } from "../../../lib/validation"
import type { AppDispatch, RootState } from "../../../store"
import { type SignupCredentials, UserRole } from "../../../types/user.types"
import { fetchCurrentUser, signupUser } from "../slices/authSlice"

export const useSignupForm = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { is_loading, error } = useSelector((state: RootState) => state.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [role, setRole] = useState<UserRole>(UserRole.TENANT)
  const [validationErrors, setValidationErrors] = useState<ValidationError>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const errors = validateSignupForm(email, password, confirmPassword, firstName, lastName, username, role)

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    // Clear validation errors
    setValidationErrors({})

    const credentials: SignupCredentials = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      username,
      role,
    }

    const resultAction = await dispatch(signupUser(credentials))

    if (signupUser.fulfilled.match(resultAction)) {
      try {
        const fetchMeAction = await dispatch(fetchCurrentUser());
        unwrapResult(fetchMeAction);
      } catch {
        console.error("Failed to fetch user data after login");
      }

      // navigate("/login");
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    username,
    setUsername,
    role,
    setRole,
    handleSubmit,
    isLoading: is_loading, // Map snake_case to camelCase for backward compatibility
    error,
    validationErrors,
  }
}