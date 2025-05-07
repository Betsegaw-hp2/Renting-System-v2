"use client"

import type React from "react"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { validateSignupForm, type ValidationError } from "../../../lib/validation"
import type { AppDispatch, RootState } from "../../../store"
import { type SignupCredentials, UserRole } from "../../../types/user.types"
import { signupUser } from "../slices/authSlice"

export const useSignupForm = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm_password, setConfirmPassword] = useState("")
  const [first_name, setFirstName] = useState("")
  const [last_name, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [role, setRole] = useState<UserRole>(UserRole.TENANT)
  const [validationErrors, setValidationErrors] = useState<ValidationError>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const errors = validateSignupForm(email, password, confirm_password, first_name, last_name, username, role)

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    // Clear validation errors
    setValidationErrors({})

    const credentials: SignupCredentials = {
      email,
      password,
      first_name,
      last_name,
      username,
      role,
    }

    const resultAction = await dispatch(signupUser(credentials))

    if (signupUser.fulfilled.match(resultAction)) {
      navigate("/dashboard")
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirm_password,
    setConfirmPassword,
    first_name,
    setFirstName,
    last_name,
    setLastName,
    username,
    setUsername,
    role,
    setRole,
    handleSubmit,
    isLoading,
    error,
    validationErrors,
  }
}
