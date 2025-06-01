"use client"

import { unwrapResult } from "@reduxjs/toolkit"
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

export const useMultiStepSignup = () => {  const [currentStep, setCurrentStep] = useState<SignupStep>("account")
  const [formData, setFormData] = useState<SignupFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { is_loading, error } = useSelector((state: RootState) => state.auth)

  const updateFormData = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErr = { ...prev }
        delete newErr[field]
        return newErr
      })
    }
  }

  const validateAccountStep = (): boolean => {
    const newErrors: Record<string,string> = {}
    if (!validateRequired(formData.email)) newErrors.email = "Email is required"
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email address"
    if (!validateRequired(formData.password)) newErrors.password = "Password is required"
    else if (!validatePassword(formData.password)) newErrors.password = "Password must be at least 8 characters with uppercase, lowercase, special characters and number"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!validateRequired(formData.first_name)) newErrors.firstName = "First name is required"
    if (!validateRequired(formData.last_name)) newErrors.lastName = "Last name is required"
    if (!validateRequired(formData.username)) newErrors.username = "Username is required"
    if (!validateRequired(formData.role)) newErrors.role = "Please select a role"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateDetailsStep = (): boolean => {
    setErrors({})
    return true
  }

  const goToNextStep = () => {
    if (currentStep === "account") {
      if (!validateAccountStep()) return
      setCurrentStep(formData.role === UserRole.TENANT ? "tenant-details" : "owner-details")
    }
  }

  const goToPreviousStep = () => {
    if (currentStep === "tenant-details" || currentStep === "owner-details") {
      setCurrentStep("account")
    }
  }

  const submitSignup = async () => {
    try {
      const { confirmPassword, ...signupData } = formData
      const signupAction = await dispatch(signupUser(signupData))
      const result = unwrapResult(signupAction)    
      const userId = result.data.user.id
      
      navigate(`/verify-email/${userId}`, {
        state: { email: formData.email }
      })
    } catch (err) {
      console.error("Signup failed:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // if (currentStep === "account") {
    //   goToNextStep()
    // } else if (currentStep === "tenant-details" || currentStep === "owner-details") {
      // if (!validateDetailsStep()) return
      if (!validateAccountStep()) return
      await submitSignup()
    // }
  }

  const skipAndCreateAccount = async () => {
    if (!validateAccountStep()) return
    await submitSignup()
  };    
  const handleOtpVerified = () => {
    // Navigation is now handled by the OTP component
    navigate("/login")
  }
  return {
    currentStep,
    formData,
    errors,
    isLoading: is_loading,
    error,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    handleSubmit,
    skipAndCreateAccount,
    handleOtpVerified,
    setCurrentStep,
  }
}