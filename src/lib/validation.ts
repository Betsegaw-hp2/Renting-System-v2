export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
  }
  
  export const validatePassword = (password: string): boolean => {
	// At least 8 characters, 1 uppercase, 1 lowercase, 1 number
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
	return passwordRegex.test(password)
  }
  
  export const validateRequired = (value: string): boolean => {
	return value.trim().length > 0
  }
  
  export interface ValidationError {
	email?: string
	password?: string
	firstName?: string
	lastName?: string
	role?: string
	confirmPassword?: string
  }
  
  export const validateSignupForm = (
	email: string,
	password: string,
	confirmPassword: string,
	firstName: string,
	lastName: string,
	role: string,
  ): ValidationError => {
	const errors: ValidationError = {}
  
	if (!validateRequired(email)) {
	  errors.email = "Email is required"
	} else if (!validateEmail(email)) {
	  errors.email = "Please enter a valid email address"
	}
  
	if (!validateRequired(password)) {
	  errors.password = "Password is required"
	} else if (!validatePassword(password)) {
	  errors.password = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
	}
  
	if (password !== confirmPassword) {
	  errors.confirmPassword = "Passwords do not match"
	}
  
	if (!validateRequired(firstName)) {
	  errors.firstName = "First name is required"
	}
  
	if (!validateRequired(lastName)) {
	  errors.lastName = "Last name is required"
	}
  
	if (!validateRequired(role)) {
	  errors.role = "Please select a role"
	}
  
	return errors
  }
  