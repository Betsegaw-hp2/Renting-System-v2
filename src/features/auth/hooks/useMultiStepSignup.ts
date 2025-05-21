"use client"

import type React from "react"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { validateEmail, validatePassword, validateRequired } from "../../../lib/validation"
import type { AppDispatch, RootState } from "../../../store"
import { UserRole } from "../../../types/user.types"
import { signupUser } from "../slices/authSlice"
import type { SignupFormData, SignupStep } from "../types/signup.types"

const initialFormData: SignupFormData = {
  email: "",
  password: "",
  confirmPassword: "",
  first_name: "",
  last_name: "",
  username: "",
  role: UserRole.TENANT,
  preferredLocation: "",
  budget: "",
  moveInDate: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  propertyTypes: [],
  propertiesOwned: "",
  idType: "",
  idNumber: "",
  dateOfBirth: "",
  phone: "",
  agreeToTerms: false,
}

export const useMultiStepSignup = () => {
  const [currentStep, setCurrentStep] = useState<SignupStep>("account");
  const [formData, setFormData] = useState<SignupFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { is_loading, error } = useSelector((state: RootState) => state.auth)

  const updateFormData = (field: keyof SignupFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateAccountStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!validateRequired(formData.email)) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!validateRequired(formData.password)) {
      newErrors.password = "Password is required"
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!validateRequired(formData.first_name)) {
      newErrors.firstName = "First name is required"
    }

    if (!validateRequired(formData.last_name)) {
      newErrors.lastName = "Last name is required"
    }

    if (!validateRequired(formData.username)) {
      newErrors.username = "Username is required"
    }

    if (!validateRequired(formData.role)) {
      newErrors.role = "Please select a role"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateDetailsStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.role === UserRole.TENANT) {
      // Tenant validation is optional now since we have a skip button
    } else if (formData.role === UserRole.PROPERTY_OWNER) {
      // Property owner validation is optional now since we have a skip button
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const goToNextStep = () => {
    if (currentStep === "account") {
      if (!validateAccountStep()) return

      // Determine next step based on selected role
      if (formData.role === UserRole.TENANT) {
        setCurrentStep("tenant-details")
      } else {
        setCurrentStep("owner-details")
      }
    }
  }

  const goToPreviousStep = () => {
    if (currentStep === "tenant-details" || currentStep === "owner-details") {
      setCurrentStep("account")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (currentStep === "account") {
      // Using goToNextStep directly here to handle the continue button
      goToNextStep()
      return
    }

    // For second step, validate and submit
    if (currentStep === "tenant-details" || currentStep === "owner-details") {
      if (!validateDetailsStep()) return

      await submitSignup()
    }
  }

  const skipAndCreateAccount = async () => {
    // Validate only the account step
    if (!validateAccountStep()) return

    // Submit with just the account information
    await submitSignup()
  }

  const submitSignup = async () => {
    try {
      const { confirmPassword, ...signupData } = formData

      const resultAction = await dispatch(signupUser(signupData))

      if (signupUser.fulfilled.match(resultAction)) {
        navigate("/home")
      }
    } catch (err) {
      console.error("Error during signup:", err)
      // The error will be handled by the Redux slice and displayed in the component
    }
  }

  return {
    currentStep,
    formData,
    errors,
    isLoading: is_loading, // Map snake_case to camelCase for backward compatibility
    error,
    updateFormData,
    goToNextStep, // Keep this for potential future use
    goToPreviousStep,
    handleSubmit,
    skipAndCreateAccount,
  }
}