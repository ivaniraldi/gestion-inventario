"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { userService } from "../api"

const UserContext = createContext()

export const useUsers = () => useContext(UserContext)

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current: 1,
  })

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await userService.getUsers(params)
      setUsers(response.data)
      setPagination(response.pagination)
    } catch (err) {
      setError(err.message || "Erro ao buscar usuários")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createUser = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await userService.createUser(userData)
      await fetchUsers()
      return response
    } catch (err) {
      setError(err.message || "Erro ao criar usuário")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (id, userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await userService.updateUser(id, userData)
      await fetchUsers()
      return response
    } catch (err) {
      setError(err.message || "Erro ao atualizar usuário")
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const value = {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

