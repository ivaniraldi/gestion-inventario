"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already authenticated
  if (isAuthenticated) {
    console.log("já autenticado")
    return <Navigate to="/products" />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor, preencha todos os campos")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await login(email, password)

      if (!result.success) {
        setError(result.message)
      }
    } catch (err) {
      setError("Ocorreu um erro ao fazer login. Tente novamente.")
      console.error("Login error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }
  const demouser = true

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sistema de Gestão</h1>
          <h2 className="mt-2 text-center text-sm text-gray-600">Faça login para acessar o sistema</h2>
          
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
              />

            </div>
            
          </div>
              {/*mostrar / ocultar senha*/}
              <div className="flex items-center justify-between p-2 border-0">
                <div className="flex items-center">
                  <input
                    id="showPassword"
                    name="showPassword"
                    type="checkbox"
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showPassword" className="ml-2 block text-sm text-gray-900">
                    Mostrar senha
                  </label>
                </div>
              </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>

        {demouser && (
           <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
           <p className="font-bold">Usuario para testes:</p>
           <p>email: anacosta@email.com </p>
           <p>senha: 123123</p>
         </div>
          )}
      </div>
    </div>
  )
}

export default LoginPage

