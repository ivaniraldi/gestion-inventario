import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const NotFoundPage = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Página não encontrada</h2>
        <p className="mt-2 text-base text-gray-500">A página que você está procurando não existe ou foi movida.</p>
        <div className="mt-6">
          <Link
            to={isAuthenticated ? "/products" : "/login"}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isAuthenticated ? "Voltar para o Dashboard" : "Voltar para o Login"}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage

