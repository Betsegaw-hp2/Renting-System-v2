import Cookies from "js-cookie"

// Cookie options
const cookieOptions = {
  expires: 7, // 7 days
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
}

// Set a cookie
export const setCookie = (name: string, value: string, options = {}) => {
  Cookies.set(name, value, { ...cookieOptions, ...options })
}

// Get a cookie
export const getCookie = (name: string) => {
  return Cookies.get(name)
}

// Remove a cookie
export const removeCookie = (name: string) => {
  Cookies.remove(name, { path: "/" })
}

// Authentication token cookie name
export const TOKEN_COOKIE_NAME = "auth_token"

// Set auth token
export const setAuthToken = (token: string, rememberMe = false) => {
  const options = rememberMe ? { ...cookieOptions } : { ...cookieOptions, expires: undefined } // Session cookie if not rememberMe

  setCookie(TOKEN_COOKIE_NAME, token, options)
}

// Get auth token
export const getAuthToken = () => {
  return getCookie(TOKEN_COOKIE_NAME)
}

// Remove auth token
export const removeAuthToken = () => {
  removeCookie(TOKEN_COOKIE_NAME)
}
