"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { API_ROUTES } from "../api/routes"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Initialize axios with base URL
  const api = axios.create({
    baseURL: "http://localhost:3000/api",
  })

  // Add token to all requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken")
      const userData = localStorage.getItem("userData")

      if (token && userData) {
        try {
          // Set default headers for future requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
          setUser(JSON.parse(userData))
          setIsAuthenticated(true)
        } catch (error) {
          console.error("Error parsing user data:", error)
          localStorage.removeItem("authToken")
          localStorage.removeItem("userData")
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true)
      const response = await api.post(API_ROUTES.AUTH.LOGIN.path, { email, password })
      const { token, user } = response.data

      // Save token and user data
      localStorage.setItem("authToken", token)
      localStorage.setItem("userData", JSON.stringify(user))

      // Set default headers for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setUser(user)
      setIsAuthenticated(true)
      navigate("/products")

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Email ou senha inválidos",
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userData")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    setIsAuthenticated(false)
    navigate("/login")
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    api,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

