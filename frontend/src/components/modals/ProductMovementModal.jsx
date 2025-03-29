import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

const ProductMovementModal = ({ isOpen, onClose, onSave, products }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'entrada',
    quantity: '',
    notes: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        product_id: '',
        type: 'entrada',
        quantity: '',
        notes: '',
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.product_id) {
      newErrors.product_id = 'Selecione um produto';
    }
    
    if (!formData.quantity) {
      newErrors.quantity = 'Informe a quantity';
    } else if (parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'A quantity deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value

    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    
    setIsSubmitting(true);
    try {
      console.log("Form Data:", formData);
      await onSave(formData);

      onClose();
    } catch (error) {
      console.error('Error al guardar el movimiento:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Ocurrió un error al registrar el movimiento'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Find selected product details
  const selectedProduct = formData.product_id 
    ? products.find(p => p.id.toString() === formData.product_id.toString())
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fade-in-up">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-medium text-gray-900" id="modal-title">
                Registrar Movimento de Produto
              </h3>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full p-1"
                aria-label="Fechar"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="product_id" className="block text-sm font-medium text-gray-700">
                    Produto <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="product_id"
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.product_id 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    aria-invalid={errors.product_id ? "true" : "false"}
                    aria-describedby={errors.product_id ? "produto-error" : undefined}
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                  {errors.product_id && (
                    <p className="mt-1 text-sm text-red-600" id="produto-error">{errors.product_id}</p>
                  )}
                </div>

                {selectedProduct && (
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    <p><span className="font-medium">Estoque atual:</span> {selectedProduct.stock} unidades</p>
                    {selectedProduct.alert_threshold >= selectedProduct.stock && (
                      <p><span className="font-medium text-red-500">Alerta de estoque:</span> {selectedProduct.alert_threshold} unidades</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    type de Movimento <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        id="type-entrada"
                        name="type"
                        type="radio"
                        value="entrada"
                        checked={formData.type === 'entrada'}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <label htmlFor="type-entrada" className="ml-2 flex items-center text-sm text-gray-700">
                        <ArrowDownIcon className="h-5 w-5 text-green-500 mr-1" />
                        Entrada
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="type-saida"
                        name="type"
                        type="radio"
                        value="saída"
                        checked={formData.type === 'saída'}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <label htmlFor="type-saida" className="ml-2 flex items-center text-sm text-gray-700">
                        <ArrowUpIcon className="h-5 w-5 text-red-500 mr-1" />
                        Saída
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.quantity 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    aria-invalid={errors.quantity ? "true" : "false"}
                    aria-describedby={errors.quantity ? "quantity-error" : undefined}
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600" id="quantity-error">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="observacao" className="block text-sm font-medium text-gray-700">
                    Observação
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Adicione detalhes sobre este movimento..."
                  ></textarea>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    isSubmitting 
                      ? 'bg-indigo-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </>
                  ) : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMovementModal;
