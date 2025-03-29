import { useAuth } from "../contexts/AuthContext"
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline"

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
              onClick={toggleSidebar}
              aria-label="Abrir menu lateral"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="ml-4 lg:ml-0">
              <h1 className="text-lg font-medium text-gray-900">Olá, {user?.name || "Usuário"}</h1>
              <p className="text-sm text-gray-500">Hoje es {new Date().toLocaleDateString()}, a las {new Date().toLocaleTimeString().slice(0, 5)}</p>
            </div>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              className="p-1 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Ver notificações"
            >
              <BellIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

