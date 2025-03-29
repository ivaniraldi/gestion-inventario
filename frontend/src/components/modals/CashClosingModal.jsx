import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { API_ROUTES } from "../../api/routes";

const CashClosingModal = ({ isOpen, onClose }) => {
  const { api } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [observations, setObservations] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post(API_ROUTES.CASH_CLOSING.CREATE.path, {
        data: date || new Date().toISOString().split("T")[0],
        observacoes: observations,
      });
      toast.success("Caixa fechado com sucesso");
      onClose();
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      toast.error(error.response?.data?.message || "Erro ao fechar caixa");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Fechamento de Caixa</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium text-gray-700">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            disabled
          />

          <label className="block mb-2 text-sm font-medium text-gray-700">Observações</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            rows="3"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Fechando..." : "Fechar Caixa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashClosingModal;