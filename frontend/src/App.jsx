import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import LoginPage from "./pages/LoginPage"
import Dashboard from "./layouts/Dashboard"
import ProductsPage from "./pages/ProductsPage"
import UsersPage from "./pages/UsersPage"
import CategoriesPage from "./pages/CategoriesPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import NotFoundPage from "./pages/NotFoundPage"
import { UserProvider } from "./contexts/UserContext"

function App() {
  const { isAuthenticated } = useAuth()

  // Protected route component
  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="users" element={
          <UserProvider>

            <UsersPage />
          </UserProvider>
          } />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="analytics" element={
          <UserProvider>

            <AnalyticsPage />
          </UserProvider>
          
          } />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App