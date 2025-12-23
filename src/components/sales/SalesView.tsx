// ============================================================================
// SALES VIEW COMPONENT - FIXED VERSION
// ============================================================================

import { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays } from 'date-fns';
import { ShoppingCart } from 'lucide-react';
import type { Sale, Product } from '../../types';
import { apiClient } from '../../services/api';
import { SaleModal } from './SaleModal';
import { Toast } from '../common/Toast';
import { SalesTableSkeleton, StatsGridSkeleton } from '../common/Skeleton';

export const SalesView = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [saleDates, setSaleDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    // Fetch available sale dates and products on mount
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const [dates, productsData] = await Promise.all([
          apiClient.getSaleDates(),
          apiClient.getProducts()
        ]);
        setSaleDates(dates);
        setProducts(productsData);
      } catch (error) {
        setToast({ message: 'Failed to load sale dates/products', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    // Fetch sales for selected date
    const fetchSales = async () => {
      setLoading(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const result = await apiClient.getSalesByDate(dateStr);
        setSales(result.sales || []);
        // Handle all possible total value cases
        const totalValue = result.total === null || result.total === undefined ? 0 :
          typeof result.total === 'string' ? parseFloat(result.total) : result.total;
        setTotal(Number.isFinite(totalValue) ? totalValue : 0);
      } catch (error) {
        setToast({ message: 'Failed to load sales', type: 'error' });
        setSales([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [selectedDate]);

  const handleCreateSale = async (items: Array<{ product: number; quantity: number; unit_price: string }>) => {
    try {
      await apiClient.createSale({ items });
      setToast({ message: 'Sale created successfully', type: 'success' });
      // Refresh sales for the current date
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const result = await apiClient.getSalesByDate(dateStr);
      setSales(result.sales);
      setTotal(typeof result.total === 'string' ? parseFloat(result.total) : result.total);
      setShowModal(false);
    } catch (error: any) {
      console.error('Sale creation error:', error.response?.data || error);
      setToast({ 
        message: error.response?.data?.detail || 'Failed to create sale', 
        type: 'error' 
      });
    }
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  // Quick toggles
  const handleToday = () => setSelectedDate(new Date());
  const handleYesterday = () => setSelectedDate(subDays(new Date(), 1));

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Sales</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Record and manage daily transactions</p>
        </div>
        <StatsGridSkeleton cards={3} />
        <div className="mt-6">
          <SalesTableSkeleton rows={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Sales</h1>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-700/50">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                Total: ${(total ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            <div className="flex gap-2">
              <button
                onClick={handleToday}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Today
              </button>
              <button
                onClick={handleYesterday}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Yesterday
              </button>
            </div>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                disableFuture
                slotProps={{
                  textField: {
                    size: 'small',
                    className: 'bg-white dark:bg-gray-700 rounded-lg'
                  }
                }}
              />
            </LocalizationProvider>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-sm hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Sale
            </button>
          </div>
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <ShoppingCart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No sales recorded</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">No sales recorded for this date</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Products Sold
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(sale.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(sale.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <ul className="space-y-1.5">
                        {sale.items.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-900 dark:text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                              <span className="font-medium">{getProductName(item.product)}</span>
                              <span className="text-gray-500 dark:text-gray-400">-</span>
                              <span className="text-gray-600 dark:text-gray-300">{item.quantity} × ${item.unit_price}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-bold text-green-700 dark:text-green-300">
                          ${sale.total_amount}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <SaleModal
          products={products}
          onClose={() => setShowModal(false)}
          onSave={handleCreateSale}
        />
      )}
    </div>
  );
}