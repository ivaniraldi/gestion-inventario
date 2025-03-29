import { NavLink } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { XMarkIcon, ShoppingBagIcon, UsersIcon, TagIcon, ChartBarIcon } from "@heroicons/react/24/outline"

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth()

  const navItems = [
    {
      name: "Gestão de Produtos",
      path: "/products",
      icon: <ShoppingBagIcon className="w-6 h-6" />,
    },
    {
      name: "Gestão de Usuários",
      path: "/users",
      icon: <UsersIcon className="w-6 h-6" />,
    },
    {
      name: "Gestão de Categorias",
      path: "/categories",
      icon: <TagIcon className="w-6 h-6" />,
    },
    {
      name: "Análises",
      path: "/analytics",
      icon: <ChartBarIcon className="w-6 h-6" />,
    },
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Sistema de Gestão</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
            >
              <XMarkIcon className="w-6 h-6" />
              <span className="sr-only">Fechar menu</span>
            </button>
          </div>

          {/* User info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">{user?.name?.charAt(0) || "U"}</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name || "Usuário"}</p>       </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout button */}
          <div className="px-4 py-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

