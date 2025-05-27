import PasswordValidator from 'password-validator';

export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
  }
  
export const validatePassword = (password: string): boolean => {
	const schema = new PasswordValidator();
	schema
		.is().min(8)                                    // Minimum length 8
		.has().uppercase()                              // Must have uppercase letters
		.has().lowercase()                              // Must have lowercase letters
		.has().digits()                                 // Must have digits
		.has().symbols();                               // Must have symbols

	console.log("Password validation schema:", schema.validate(password));
	return schema.validate(password) as boolean;
}
  
  export const validateRequired = (value: string): boolean => {
	return value.trim().length > 0
  }
  
  export interface ValidationError {
	email?: string
	password?: string
	firstName?: string
	lastName?: string
	username?: string
	role?: string
	confirmPassword?: string
  }
  
  export const validateSignupForm = (
	email: string,
	password: string,
	confirmPassword: string,
	firstName: string,
	lastName: string,
	username: string,
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
	  errors.password = "Password must be at least 8 characters with 1 uppercase, 1 special character, 1 lowercase, and 1 number"
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
  
	if (!validateRequired(username)) {
	  errors.username = "Username is required"
	}
  
	if (!validateRequired(role)) {
	  errors.role = "Please select a role"
	}
  
	return errors
  }
  