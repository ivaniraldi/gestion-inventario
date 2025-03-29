"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"
import { Chart, registerables } from "chart.js"
import { API_ROUTES } from "../api/routes"
import { useUsers } from "../contexts/UserContext"
import axios from "axios"

// Register Chart.js components
Chart.register(...registerables)

const AnalyticsPage = () => {
  const { api } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const { users } = useUsers()
  const [currencies , setCurrencies] = useState([])
  const [movementsData, setMovementsData] = useState(null)
  const [cashClosures, setCashClosures] = useState(null)
  const [period, setPeriod] = useState("month")
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })

//Currency change 

 const getCurrencies = async () =>{
  const apiURL = "https://api.currencyapi.com/v3/latest?apikey=cur_live_B41fNSunTVFGDubhkgZTaJrt3zxi4OIxGoOzsQCh&currencies=EUR%2CUSD%2CCAD&base_currency=BRL"
  const response = await axios.get(apiURL)
  setCurrencies(response.data.data)
 }
 useEffect(() => {
  getCurrencies()
}, [])

console.log(currencies)

  // Chart refs
  const movementsChartRef = useRef(null)
  const cashChartRef = useRef(null)
  const alertsChartRef = useRef(null)

  // Chart instances
  const movementsChartInstance = useRef(null)
  const cashChartInstance = useRef(null)
  const alertsChartInstance = useRef(null)

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get(API_ROUTES.ANALYTICS.SUMMARY.path, {
        params: { period },
      })
      setSummary(response.data)
    } catch (error) {
      console.error("Error fetching summary:", error)
      toast.error("Erro ao carregar resumo")
    }
  }, [api, period])

  // Fetch movements data
  const fetchMovements = useCallback(async () => {
    try {
      const response = await api.get(API_ROUTES.ANALYTICS.MOVEMENTS.path, {
        params: dateRange,
      })
      setMovementsData(response.data)
    } catch (error) {
      console.error("Error fetching movements:", error)
      toast.error("Erro ao carregar dados de movimentos")
    }
  }, [api, dateRange])

  // Fetch cash closures data
  const fetchCashClosures = useCallback(async () => {
    try {
      const response = await api.get(API_ROUTES.CASH_CLOSING.LIST.path, {
        params: dateRange,
      })
      setCashClosures(response.data) // Ajustado según la estructura de respuesta
    } catch (error) {
      console.error("Error fetching cash closures:", error)
      toast.error("Erro ao carregar fechamentos de caixa")
    }
  }, [api, dateRange])

  // Fetch data on component mount and when period/date range changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([fetchSummary(), fetchMovements(), fetchCashClosures()])
      setIsLoading(false)
    }
    fetchData()
  }, [fetchSummary, fetchMovements, fetchCashClosures])

  // Initialize and update charts when data changes
  useEffect(() => {
    if (isLoading || !movementsData || !cashClosures || !summary) return

    // Destroy existing charts
    if (movementsChartInstance.current) movementsChartInstance.current.destroy()
    if (cashChartInstance.current) cashChartInstance.current.destroy()
    if (alertsChartInstance.current) alertsChartInstance.current.destroy()

    // Movements Line Chart (Entradas vs Saídas)
    if (movementsChartRef.current && movementsData.daily) {
      const dates = movementsData.daily.map((item) => item.date)
      const entradas = movementsData.daily.map((item) => item.entradas)
      const saidas = movementsData.daily.map((item) => item.saidas)

      movementsChartInstance.current = new Chart(movementsChartRef.current, {
        type: "line",
        data: {
          labels: dates,
          datasets: [
            {
              label: "Entradas",
              data: entradas,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
              tension: 0.3,
            },
            {
              label: "Saídas",
              data: saidas,
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: "Movimentos (Entradas vs Saídas)", font: { size: 16 } },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "Quantidade" } },
            x: { title: { display: true, text: "Data" } },
          },
        },
      })
    }

    // Cash Closures Bar Chart (Valor Total por Fechamento)
    if (cashChartRef.current && cashClosures) {
      const dates = cashClosures.map((item) => item.data)
      const values = cashClosures.map((item) => item.valorTotal)

      cashChartInstance.current = new Chart(cashChartRef.current, {
        type: "bar",
        data: {
          labels: dates,
          datasets: [
            {
              label: "Valor Total (R$)",
              data: values,
              backgroundColor: "rgba(54, 162, 235, 0.7)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: "Fechamentos de Caixa", font: { size: 16 } },
            tooltip: {
              callbacks: { label: (context) => `R$ ${context.raw.toLocaleString("pt-BR")}` },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (value) => `R$ ${value.toLocaleString("pt-BR")}` },
              title: { display: true, text: "Valor (R$)" },
            },
            x: { title: { display: true, text: "Data" } },
          },
        },
      })
    }

    // Alerts Pie Chart (Distribuição de Alertas)
    if (alertsChartRef.current && summary) {
      const totalProdutos = summary.totalProdutos || 0
      const alertas = summary.alertas || 0
      const produtosOK = totalProdutos - alertas

      alertsChartInstance.current = new Chart(alertsChartRef.current, {
        type: "pie",
        data: {
          labels: ["Produtos em Alerta", "Produtos OK"],
          datasets: [
            {
              data: [alertas, produtosOK],
              backgroundColor: ["rgba(255, 99, 132, 0.7)", "rgba(75, 192, 192, 0.7)"],
              borderColor: ["rgba(255, 99, 132, 1)", "rgba(75, 192, 192, 1)"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: "Distribuição de Alertas de Estoque", font: { size: 16 } },
            tooltip: {
              callbacks: { label: (context) => `${context.label}: ${context.raw} (${((context.raw / totalProdutos) * 100).toFixed(1)}%)` },
            },
          },
        },
      })
    }

    return () => {
      if (movementsChartInstance.current) movementsChartInstance.current.destroy()
      if (cashChartInstance.current) cashChartInstance.current.destroy()
      if (alertsChartInstance.current) alertsChartInstance.current.destroy()
    }
  }, [isLoading, movementsData, cashClosures, summary])

  // Handle period change
  const handlePeriodChange = (e) => setPeriod(e.target.value)

  // Handle date range change
  const handleDateChange = (e, field) => setDateRange({ ...dateRange, [field]: e.target.value })

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h1 className="text-3xl font-bold text-gray-900">Análises</h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={period}
            onChange={handlePeriodChange}
            className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 max-w-xs"
            aria-label="Selecionar período"
          >
            <option value="day">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500">Total de Produtos</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{isLoading ? "..." : summary?.totalProdutos || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500">Valor Total em Estoque</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
          {isLoading ? "..." : `${(parseFloat(summary?.valorTotal) || 0).toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' })}`}

          </p>
          <p className="text-xs text-gray-600">{((parseFloat(summary?.valorTotal) || 0)  * currencies.USD?.value).toLocaleString("pt-BR", { style: 'currency', currency: 'USD' })} </p>
          <p className="text-xs text-gray-600">{((parseFloat(summary?.valorTotal) || 0)  * currencies.CAD?.value).toLocaleString("pt-BR", { style: 'currency', currency: 'CAD' })}</p>
          <p className="text-xs text-gray-600">{((parseFloat(summary?.valorTotal) || 0)  * currencies.EUR?.value).toLocaleString("pt-BR", { style: 'currency', currency: 'EUR' })}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500">Movimentos</h3>
          <div className="mt-1 flex items-baseline space-x-4">
            <p className="text-2xl font-semibold text-green-600">
              {isLoading ? "..." : summary?.movimentos?.entradas || 0}
              <span className="ml-1 text-sm font-medium text-gray-500">entradas</span>
            </p>
            <p className="text-2xl font-semibold text-red-600">
              {isLoading ? "..." : summary?.movimentos?.saidas || 0}
              <span className="ml-1 text-sm font-medium text-gray-500">saídas</span>
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500">Produtos em Alerta</h3>
          <p className="mt-1 text-2xl font-semibold text-red-600">{isLoading ? "..." : summary?.alertas || 0}</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Intervalo de Datas</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="startDate" className="block text-xs text-gray-500 mb-1">Data Inicial</label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange(e, "startDate")}
              className="form-input rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-full"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="endDate" className="block text-xs text-gray-500 mb-1">Data Final</label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange(e, "endDate")}
              className="form-input rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-full"
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movements Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Carregando gráfico...</p>
              </div>
            ) : (
              <canvas ref={movementsChartRef} aria-label="Gráfico de movimentos por dia" role="img"></canvas>
            )}
          </div>
        </div>

        {/* Cash Closures Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Carregando gráfico...</p>
              </div>
            ) : (
              <canvas ref={cashChartRef} aria-label="Gráfico de fechamentos de caixa" role="img"></canvas>
            )}
          </div>
        </div>

        {/* Alerts Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:col-span-2">
          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Carregando gráfico...</p>
              </div>
            ) : (
              <canvas ref={alertsChartRef} aria-label="Gráfico de alertas de estoque" role="img"></canvas>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="space-y-6">
        {/* Movements Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes dos Movimentos</h3>
          {isLoading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Data</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Entradas</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Saídas</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {movementsData?.daily?.map((item, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{item.entradas}</td>
                      <td className="px-4 py-2">{item.saidas}</td>
                      <td className="px-4 py-2">R$ {Number(item.valor).toLocaleString("pt-BR")}</td>
                    </tr>
                  ))}
                  <tr className="border-t font-semibold">
                    <td className="px-4 py-2">Total</td>
                    <td className="px-4 py-2">{movementsData?.totals?.entradas || 0}</td>
                    <td className="px-4 py-2">{movementsData?.totals?.saidas || 0}</td>
                    <td className="px-4 py-2">R$ {Number(movementsData?.totals?.valor || 0).toLocaleString("pt-BR")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cash Closures Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes dos Fechamentos de Caixa</h3>
          {isLoading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Data</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total Movimentos</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Entradas</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Saídas</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor Total (R$)</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Usuário</th>
                  </tr>
                </thead>
                <tbody>
                  {cashClosures?.map((item, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{new Date(item.closure_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{item.total_movements}</td>
                      <td className="px-4 py-2 text-green-600">{Math.round(item.entries)}</td>
                      <td className="px-4 py-2 text-red-600">{Math.round(item.exits)}</td>
                      <td className={`px-4 py-2 font-bold ${item.total_value > 0 ? "text-green-800" : "text-red-600"}`}>R$ {Number(item.total_value).toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-2">{
                        users.find((u) => u.id === item.user_id)?.nome || "Usuário não encontrado"
                        }</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage