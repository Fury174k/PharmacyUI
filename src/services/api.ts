import type { Product, Sale, User, TrendData, AlertsResponse } from '../types';

const API_BASE_URL = 'https://pharmacy-api-mn83.onrender.com/api';

class ApiClient {
  async getSalesByDate(date?: string) {
    const endpoint = date ? `/sales/by_date/?date=${date}` : '/sales/by_date/';
    return this.request<{ total: number; sales: Sale[] }>(endpoint);
  }

  async getSaleDates() {
    return this.request<string[]>('/sales/by_date/');
  }

  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Token ${token}`; // ✅ DRF Token format
      }
    }

    return headers;
  }

  /**
   * Generic request helper that:
   * - Adds headers
   * - Parses JSON
   * - Handles unified DRF error responses (message, status_code)
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(true),
          ...options.headers,
        },
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // In case response is empty or not JSON
        data = null;
      }

      if (!response.ok) {
        // 🧩 Extract backend error message if present
        const message =
          data?.message ||
          data?.detail ||
          `Request failed with status ${response.status}`;

        const error = new Error(message);
        (error as any).status = data?.status_code || response.status;
        (error as any).data = data;
        throw error;
      }

      return data;
    } catch (err: any) {
      // 🛑 Handle network or unexpected errors
      if (err.name === 'TypeError') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw err;
    }
  }

  async login(username: string, password: string) {
    return this.request('/login/', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username: string, email: string, password: string) {
    return this.request<{ token: string; user: User }>('/register/', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ username, email, password }),
    });
  }

  async getUser() {
    return this.request<User>('/user/');
  }

  async getProducts() {
    return this.request<Product[]>('/products/');
  }

  async createProduct(product: Partial<Product>) {
    return this.request<Product>('/products/', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, product: Partial<Product>) {
    return this.request<Product>(`/products/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}/`, {
      method: 'DELETE',
    });
  }

  async importProductsCSV(file: File) {
    const endpoint = '/products/import_csv/';
    const form = new FormData();
    form.append('file', file);

    const headers = { ...this.getHeaders(true) } as Record<string, string>;
    if (headers['Content-Type']) delete headers['Content-Type'];

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: form,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          data?.message || `CSV import failed with status ${response.status}`;
        const error = new Error(message);
        (error as any).status = data?.status_code || response.status;
        (error as any).data = data;
        throw error;
      }

      return data;
    } catch (err: any) {
      if (err.name === 'TypeError') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw err;
    }
  }

  async getSales() {
    return this.request<Sale[]>('/sales/');
  }

  async createSale(sale: {
    items: Array<{ product: number; quantity: number; unit_price: string }>;
  }) {
    return this.request<Sale>('/sales/', {
      method: 'POST',
      body: JSON.stringify({
        items: sale.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      }),
    });
  }

  async getSalesTrend(period: 'daily' | 'weekly' | 'monthly'): Promise<TrendData[]> {
    return this.request<TrendData[]>(`/sales/trend/?period=${period}`);
  }

  // 🔔 Alert endpoints
  async getLowStockAlerts(): Promise<AlertsResponse> {
    return this.request<AlertsResponse>('/alerts/low-stock/');
  }

  async getAlertHistory(): Promise<AlertsResponse> {
    return this.request<AlertsResponse>('/alerts/history/');
  }

  async acknowledgeAlert(alertId: number): Promise<void> {
    return this.request(`/alerts/acknowledge/`, {
      method: 'POST',
      body: JSON.stringify({ alert_ids: alertId }),
    });
  }

  async acknowledgeAllAlerts(): Promise<void> {
    return this.request(`/alerts/acknowledge-all/`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
