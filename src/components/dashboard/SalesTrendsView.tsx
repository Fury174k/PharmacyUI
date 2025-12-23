import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'react-feather';
import { apiClient } from '../../services/api';
import { Toast } from '../common/Toast';
import { ChartSkeleton, StatsGridSkeleton } from '../common/Skeleton';

// ============================================================================
// TYPES
// ============================================================================

interface TrendData {
  date: string;
  total_sales: number;
  total_amount: string;
  count: number;
}

type Period = 'daily' | 'weekly' | 'monthly';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SalesTrendsView = () => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('weekly');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadTrendData();
  }, [period]);

  const loadTrendData = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getSalesTrend(period);
      setTrendData(data);
    } catch (error) {
      setToast({ message: 'Failed to load sales trends', type: 'error' });
      setTrendData([]);
    } finally {
      setLoading(false);
    }
  };

  // Format data for recharts (sanitize numeric fields)
  const chartData = trendData.map(item => {
    const amt = parseFloat(item.total_amount as any);
    const amount = Number.isFinite(amt) ? amt : 0;
    const sales = Number.isFinite(item.count) ? item.count : 0;
    return {
      date: formatDate(item.date, period),
      amount,
      sales,
    };
  });

  // Calculate summary stats (use sanitized chartData)
  const totalRevenue = chartData.reduce((sum, d) => sum + (Number.isFinite(d.amount) ? d.amount : 0), 0);
  const totalSales = chartData.reduce((sum, d) => sum + (Number.isFinite(d.sales) ? d.sales : 0), 0);
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Custom tooltip for chart (robust against missing payload entries)
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !Array.isArray(payload) || payload.length === 0) return null;

    const firstPayload = payload[0] || {};
    const payloadDate = firstPayload.payload?.date ?? '';

    const amountEntry = payload.find((p: any) => p.dataKey === 'amount') ?? firstPayload;
    const salesEntry = payload.find((p: any) => p.dataKey === 'sales') ?? payload[1] ?? { value: 0 };

    const amountVal = Number(amountEntry?.value ?? 0);
    const salesVal = Number(salesEntry?.value ?? 0);

    const safeAmount = Number.isFinite(amountVal) ? amountVal : 0;
    const safeSales = Number.isFinite(salesVal) ? salesVal : 0;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{payloadDate}</p>
        <div className="space-y-1">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Revenue: ${safeAmount.toFixed(2)}</p>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Sales: {safeSales}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Sales Trends</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Analyze your sales performance over time</p>
        </div>
        <StatsGridSkeleton cards={3} />
        <div className="mt-6">
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Sales Trends</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Analyze your sales performance over time</p>
          </div>

          {/* Period Toggle Buttons */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                period === 'daily'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                period === 'weekly'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                period === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {totalSales}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Average Sale</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                ${averageSale.toFixed(2)}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {chartData.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No data available</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">No sales data available for this period</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {period.charAt(0).toUpperCase() + period.slice(1)} Performance
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your revenue and sales over time</p>
          </div>

          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '14px' }}
                  iconType="line"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Revenue ($)"
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Sales Count"
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Data Table */}
      {trendData.length > 0 && (
        <div className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Breakdown</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">View individual period performance</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Sales Count
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Avg Sale
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {trendData.map((item, index) => {
                  const rawAmount = Number(parseFloat(item.total_amount as any));
                  const safeAmount = Number.isFinite(rawAmount) ? rawAmount : 0;
                  const safeCount = Number.isFinite(item.count) ? item.count : 0;
                  const avgSale = safeCount > 0 ? safeAmount / safeCount : 0;
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(item.date, period)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {safeCount}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          ${safeAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${avgSale.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateStr: string, period: Period): string {
  const date = new Date(dateStr);
  
  switch (period) {
    case 'daily':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'weekly':
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    case 'monthly':
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    default:
      return dateStr;
  }
}