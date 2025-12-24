import React, { useState } from 'react';
import type { Product } from '../../types';

interface SaleModalProps {
  products: Product[];
  onClose: () => void;
  onSave: (items: Array<{ product: number; quantity: number; unit_price: string }>) => Promise<void>;
}

export const SaleModal: React.FC<SaleModalProps> = ({ products, onClose, onSave }) => {
  const [saleItems, setSaleItems] = useState<Array<{ product: number; quantity: number; unit_price: string }>>([
    { product: 0, quantity: 1, unit_price: '0.00' }
  ]);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setSaleItems([...saleItems, { product: 0, quantity: 1, unit_price: '0.00' }]);
  };

  const removeItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...saleItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'product') {
      const selectedProduct = products.find(p => p.id === parseInt(value));
      if (selectedProduct) {
        newItems[index].unit_price = selectedProduct.unit_price;
      }
    }
    
    setSaleItems(newItems);
  };

  const calculateSubtotal = (item: typeof saleItems[0]) => {
    return (parseFloat(item.unit_price) * item.quantity).toFixed(2);
  };

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => sum + parseFloat(calculateSubtotal(item)), 0).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = saleItems.filter(item => item.product > 0);
    if (validItems.length === 0) {
      alert('Please add at least one product');
      return;
    }

    setLoading(true);
    
    try {
      await onSave(validItems);
      onClose();
    } catch (error) {
      console.error('Failed to create sale:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Sale</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {saleItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-1">
                    <select
                      value={item.product}
                      onChange={(e) => updateItem(index, 'product', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value={0}>Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (${product.unit_price})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Quantity"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="text"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Unit Price"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="text"
                      value={calculateSubtotal(item)}
                      className="w-full rounded-md border-gray-300 bg-gray-50 dark:bg-gray-600 dark:border-gray-500 text-gray-500 dark:text-gray-400"
                      placeholder="Subtotal"
                      disabled
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Add Item
              </button>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Total: ${calculateTotal()}
              </div>
              <div className="space-x-4">
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
                  {loading ? 'Creating Sale...' : 'Create Sale'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};