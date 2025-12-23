import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, Check, Package, Filter } from 'react-feather';
import type { Alert, AlertsResponse } from '../../types/index';
import { apiClient } from '../../services/api';
import { Toast } from '../common/Toast';

export const AlertsView = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, filterSeverity, filterStatus]);

  const loadAlerts = async () => {
  setLoading(true);
  try {
    const data = await apiClient.getAlertHistory(); 
    console.log('Backend response:', data);
    setAlerts(data.alerts || []);
    setUnreadCount(data.unread_count || 0);
    setCriticalCount(data.critical_count || 0);
  } catch (error) {
     setToast({ message: 'Failed to load alerts', type: 'error' });
     setAlerts([]);
     setFilteredAlerts([]);
  } finally {
    setLoading(false);
  }
};

  const applyFilters = () => {
    let filtered = [...alerts];

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }

    if (filterStatus === 'unread') {
      filtered = filtered.filter(alert => !alert.acknowledged);
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(alert => alert.acknowledged);
    }

    setFilteredAlerts(filtered);
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      await apiClient.acknowledgeAlert(alertId);
      setToast({ message: 'Alert marked as read', type: 'success' });
      await loadAlerts();
    } catch (error) {
      setToast({ message: 'Failed to acknowledge alert', type: 'error' });
    }
  };

  const handleAcknowledgeAll = async () => {
    if (!confirm('Mark all alerts as read?')) return;

    try {
      await apiClient.acknowledgeAllAlerts();
      setToast({ message: 'All alerts marked as read', type: 'success' });
      await loadAlerts();
    } catch (error) {
      setToast({ message: 'Failed to acknowledge alerts', type: 'error' });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[severity as keyof typeof styles]}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Stock Alerts</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleAcknowledgeAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{criticalCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Unread Alerts</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                 Showing {filteredAlerts?.length || 0} of {alerts?.length || 0} alerts
            </span>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Alerts</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{alerts.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read Only</option>
        </select>

        <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </span>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No alerts found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAlerts.map((alert) => (
                  <tr 
                    key={alert.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      !alert.acknowledged ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.product.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            SKU: {alert.product.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">{alert.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getSeverityBadge(alert.severity)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {alert.product.stock}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400"> / {alert.product.reorder_level}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {alert.days_low_stock} day{alert.days_low_stock !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {alert.acknowledged ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-full">
                          <Check className="w-3 h-3" />
                          Read
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                          Unread
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
