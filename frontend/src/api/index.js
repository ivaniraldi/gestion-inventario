import axios from "axios"
import { API_ROUTES } from "./routes"

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGIN.path, { email, password })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao fazer login" }
    }
  },
  logout: async () => {
    try {
      await api.post(API_ROUTES.AUTH.LOGOUT.path)
      localStorage.removeItem("authToken")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  },
}

export const productService = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get(API_ROUTES.PRODUCTS.LIST.path, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao buscar produtos" }
    }
  },
  createProduct: async (productData) => {
    try {
      const response = await api.post(API_ROUTES.PRODUCTS.CREATE.path, productData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao criar produto" }
    }
  },
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(API_ROUTES.PRODUCTS.UPDATE.path.replace(":id", id), productData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao atualizar produto" }
    }
  },
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(API_ROUTES.PRODUCTS.DELETE.path.replace(":id", id))
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao excluir produto" }
    }
  },
}

export const movementService = {
  getMovements: async (params = {}) => {
    try {
      const response = await api.get(API_ROUTES.MOVEMENTS.LIST.path, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao buscar movimentos" }
    }
  },
  createMovement: async (movementData) => {
    try {
      const response = await api.post(API_ROUTES.MOVEMENTS.CREATE.path, movementData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao registrar movimento" }
    }
  },
}

export const analyticsService = {
  getSummary: async (period = "month") => {
    try {
      const response = await api.get(API_ROUTES.ANALYTICS.SUMMARY.path, { params: { period } })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao buscar resumo" }
    }
  },
  getMovementsAnalytics: async (startDate, endDate) => {
    try {
      const response = await api.get(API_ROUTES.ANALYTICS.MOVEMENTS.path, {
        params: { startDate, endDate },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao buscar análises de movimentos" }
    }
  },
}

export const userService = {
  getUsers: async (params = {}) => {
    try {
      const response = await api.get(API_ROUTES.USERS.LIST.path, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao buscar usuários" }
    }
  },
  createUser: async (userData) => {
    try {
      const response = await api.post(API_ROUTES.USERS.CREATE.path, userData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao criar usuário" }
    }
  },
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(API_ROUTES.USERS.UPDATE.path.replace(":id", id), userData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao atualizar usuário" }
    }
  },
}

export const cashClosingService = {
  createCashClosure: async (data) => { // Cambiado a createCashClosure para coincidir con AnalyticsProvider
    try {
      const response = await api.post(API_ROUTES.CASH_CLOSING.CREATE.path, data)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao realizar fechamento de caixa" }
    }
  },
  getCashClosures: async (params = {}) => { // Cambiado a getCashClosures para coincidir con AnalyticsProvider
    console.log("Params:", params);
    try {
      const response = await api.get(API_ROUTES.CASH_CLOSING.LIST.path)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Erro ao buscar fechamentos de caixa" }
    }
  },
}

export default api