"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import CategoryModal from "../components/modals/CategoryModal"
import ConfirmationModal from "../components/modals/ConfirmationModal"
import { API_ROUTES } from "../api/routes"

const CategoriesPage = () => {
  const { api } = useAuth()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get(API_ROUTES.CATEGORIES.LIST.path)
      setCategories(response.data)

    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Erro ao carregar categorias")
    } finally {
      setIsLoading(false)
    }
  }, [api])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Filter categories by search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle category creation/update
  const handleSaveCategory = async (categoryData) => {
    try {
      if (currentCategory) {
        // Update existing category
        await api.put(API_ROUTES.CATEGORIES.UPDATE.path.replace(":id", currentCategory.id), categoryData)
        toast.success("Categoria atualizada com sucesso")
      } else {
        // Create new category
        await api.post(API_ROUTES.CATEGORIES.CREATE.path, categoryData)
        toast.success("Categoria criada com sucesso")
      }

      setIsCategoryModalOpen(false)
      fetchCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error(error.response?.data?.message || "Erro ao salvar categoria")
    }
  }

  // Handle category deletion
  const handleDeleteCategory = async () => {
    if (!currentCategory) return

    try {
      await api.delete(API_ROUTES.CATEGORIES.DELETE.path.replace(":id", currentCategory.id))
      toast.success("Categoria excluída com sucesso")
      setIsDeleteModalOpen(false)
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error(error.response?.data?.message || "Erro ao excluir categoria")
    }
  }

  // Open category modal for editing
  const openEditModal = (category) => {
    setCurrentCategory(category)
    setIsCategoryModalOpen(true)
  }

  // Open category modal for creating
  const openCreateModal = () => {
    setCurrentCategory(null)
    setIsCategoryModalOpen(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (category) => {
    setCurrentCategory(category)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Categorias</h1>

        <button onClick={openCreateModal} className="btn btn-primary flex items-center">
          <PlusIcon className="w-5 h-5 mr-1" />
          Adicionar Nova Categoria
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar Categoria
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nome da categoria..."
            className="form-input"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Carregando categorias...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? "Nenhuma categoria encontrada com esse termo" : "Nenhuma categoria cadastrada"}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <li key={category.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-50"
                      aria-label={`Editar ${category.name}`}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(category)}
                      className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
                      aria-label={`Excluir ${category.name}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={currentCategory}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCategory}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${currentCategory?.name}"? Esta ação não pode ser desfeita e pode afetar produtos relacionados.`}
      />
    </div>
  )
}

export default CategoriesPage

