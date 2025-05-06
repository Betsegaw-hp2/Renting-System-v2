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
  firstName: "",
  lastName: "",
  role: UserRole.TENANT,
  preferredLocation: "",
  budget: "",
  moveInDate: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  companyName: "",
  businessType: "",
  propertyTypes: [],
  propertiesOwned: "",
  idType: "",
  idNumber: "",
  dateOfBirth: "",
  phoneNumber: "",
  agreeToTerms: false,
}

export const useMultiStepSignup = () => {
  const [currentStep, setCurrentStep] = useState<SignupStep>("account")
  const [formData, setFormData] = useState<SignupFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

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

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === "account") {
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

      if (!validateRequired(formData.firstName)) {
        newErrors.firstName = "First name is required"
      }

      if (!validateRequired(formData.lastName)) {
        newErrors.lastName = "Last name is required"
      }
    }

    if (currentStep === "tenant-details") {
      if (!validateRequired(formData.preferredLocation || "")) {
        newErrors.preferredLocation = "Preferred location is required"
      }

      if (!validateRequired(formData.budget || "")) {
        newErrors.budget = "Budget is required"
      }

      if (!validateRequired(formData.moveInDate || "")) {
        newErrors.moveInDate = "Move-in date is required"
      }

      if (!validateRequired(formData.phoneNumber)) {
        newErrors.phoneNumber = "Phone number is required"
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "You must agree to the terms and conditions"
      }
    }

    if (currentStep === "owner-details") {
      // Validate location fields
      if (!validateRequired(formData.address || "")) {
        newErrors.address = "Address is required"
      }

      if (!validateRequired(formData.city || "")) {
        newErrors.city = "City is required"
      }

      if (!validateRequired(formData.state || "")) {
        newErrors.state = "State is required"
      }

      if (!validateRequired(formData.zipCode || "")) {
        newErrors.zipCode = "Zip code is required"
      }

      // Validate property info fields
      if (!validateRequired(formData.businessType || "")) {
        newErrors.businessType = "Business type is required"
      }

      if (!validateRequired(formData.propertiesOwned || "")) {
        newErrors.propertiesOwned = "Number of properties is required"
      }

      if (!formData.propertyTypes?.length) {
        newErrors.propertyTypes = "Please select at least one property type"
      }

      // Validate KYC fields
      if (!validateRequired(formData.idType || "")) {
        newErrors.idType = "ID type is required"
      }

      if (!validateRequired(formData.idNumber || "")) {
        newErrors.idNumber = "ID number is required"
      }

      if (!validateRequired(formData.dateOfBirth || "")) {
        newErrors.dateOfBirth = "Date of birth is required"
      }

      if (!validateRequired(formData.phoneNumber)) {
        newErrors.phoneNumber = "Phone number is required"
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "You must agree to the terms and conditions"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const goToNextStep = () => {
    if (!validateStep()) return

    if (currentStep === "account") {
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

    if (!validateStep()) return

    // Only submit if we're on the role-specific step
    if (currentStep === "tenant-details" || currentStep === "owner-details") {
      const { confirmPassword, ...signupData } = formData

      const resultAction = await dispatch(signupUser(signupData))

      if (signupUser.fulfilled.match(resultAction)) {
        navigate("/dashboard")
      }
    } else {
      goToNextStep()
    }
  }

  return {
    currentStep,
    formData,
    errors,
    isLoading,
    error,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    handleSubmit,
  }
}
