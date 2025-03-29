"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { analyticsService, cashClosingService } from "../api"

const AnalyticsContext = createContext()

export const useAnalytics = () => useContext(AnalyticsContext)

export const AnalyticsProvider = ({ children }) => {
  const [summary, setSummary] = useState(null)
  const [movementsData, setMovementsData] = useState(null)
  const [cashClosures, setCashClosures] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cashPagination, setCashPagination] = useState({
    total: 0,
    pages: 0,
    current: 1,
  })

  const fetchSummary = useCallback(async (period = "month") => {
    setLoading(true)
    setError(null)
    try {
      const data = await analyticsService.getSummary(period)
      setSummary(data)
      return data
    } catch (err) {
      setError(err.message || "Erro ao buscar resumo")
      console.error("Error fetching summary:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMovementsAnalytics = useCallback(async (startDate, endDate) => {
    setLoading(true)
    setError(null)
    try {
      const data = await analyticsService.getMovementsAnalytics(startDate, endDate)
      setMovementsData(data)
      return data
    } catch (err) {
      setError(err.message || "Erro ao buscar análises de movimentos")
      console.error("Error fetching movements analytics:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCashClosures = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      console.log(params)
      const data = await cashClosingService.getCashClosures()
      console.log("Cash Closures:", data);
      setCashClosures(data.data)
      setCashPagination(data.pagination)
      return data
    } catch (err) {
      setError(err.message || "Erro ao buscar fechamentos de caixa")
      console.error("Error fetching cash closures:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCashClosure = useCallback(async (closureData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await cashClosingService.createCashClosure(closureData)
      await fetchCashClosures()
      return response
    } catch (err) {
      setError(err.message || "Erro ao criar fechamento de caixa")
      console.error("Error creating cash closure:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchCashClosures])

  const value = {
    summary,
    movementsData,
    cashClosures,
    loading,
    error,
    cashPagination,
    fetchSummary,
    fetchMovementsAnalytics,
    fetchCashClosures,
    createCashClosure,
  }

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}