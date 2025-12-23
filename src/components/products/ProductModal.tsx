import { useState, useEffect } from 'react';
import type { Product } from '../../types';

// Function to generate a random SKU
const generateSKU = (name: string = '') => {
  const prefix = name ? name.substring(0, 3).toUpperCase() : 'PRD';
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    unit_price: product?.unit_price || '',
    unit: product?.unit || 'capsule',
    stock: product?.stock || 0,
    reorder_level: product?.reorder_level,
    active: product?.active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generate initial SKU for new products
  useEffect(() => {
    if (!product && !formData.sku) {
      setFormData(prev => ({
        ...prev,
        sku: generateSKU()
      }));
    }
  }, [product]);

  // Generate new SKU when name changes (for new products only)
  useEffect(() => {
    if (!product && formData.name) {
      setFormData(prev => ({
        ...prev,
        sku: generateSKU(formData.name)
      }));
    }
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      
      // Handle DRF validation errors
      if (error.response?.data) {
        const drf_error = error.response.data;
        
        // Check for field-specific errors (DRF format)
        if (drf_error.sku && Array.isArray(drf_error.sku)) {
          const skuError = drf_error.sku[0]; // Get first SKU error
          if (skuError.includes('SKU already exists')) {
            const newSku = generateSKU(formData.name);
            setError(`This SKU is already in use. We've generated a new one: ${newSku}`);
            setFormData(prev => ({
              ...prev,
              sku: newSku
            }));
          } else {
            setError(`SKU Error: ${skuError}`);
          }
        } else if (typeof drf_error === 'object') {
          // Handle other field errors
          const firstError = Object.entries(drf_error)[0];
          if (firstError) {
            const [field, messages] = firstError;
            setError(`${field}: ${Array.isArray(messages) ? messages[0] : messages}`);
          } else {
            setError('Validation error occurred');
          }
        } else {
          setError(drf_error.detail || 'An error occurred while saving');
        }
      } else {
        setError(error?.message || 'Failed to save product');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  SKU
                  {!product && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sku: generateSKU(formData.name) }))}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Generate New
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    error?.includes('SKU') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  required
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit Price
                </label>
                <input
                  type="text"
                  id="unit_price"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit
                </label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="capsule">Capsule</option>
                  <option value="tablet">Tablet</option>
                  <option value="bottle">Bottle</option>
                  <option value="box">Box</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="reorder_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reorder Level
                </label>
                <input
                  type="number"
                  id="reorder_level"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};