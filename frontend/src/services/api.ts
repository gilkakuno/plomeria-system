import axios from 'axios'

const API_URL = (import.meta as any).env?.PROD
  ? 'https://plomeria-backend.onrender.com'
  : 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (data: { username: string; password: string; captchaToken: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  register: (data: any) => api.post('/auth/register', data),
  checkPassword: (password: string) => api.post('/auth/check-password', { password }),
  profile: () => api.get('/auth/profile'),
}

// ── Users ─────────────────────────────────────────────
export const usersAPI = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
}

// ── Inventory ─────────────────────────────────────────
export const inventoryAPI = {
  getAll: (search?: string, category?: string) =>
    api.get('/inventory', { params: { search, category } }),
  getOne: (id: string) => api.get(`/inventory/${id}`),
  create: (data: any) => api.post('/inventory', data),
  update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
  getLowStock: () => api.get('/inventory/alerts/low-stock'),
  getCategories: () => api.get('/inventory/categories'),
  getTopUsed: () => api.get('/inventory/stats/top-used'),
}

// ── Clients ───────────────────────────────────────────
export const clientsAPI = {
  getAll: (search?: string) => api.get('/clients', { params: { search } }),
  getOne: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
}

// ── Projects ──────────────────────────────────────────
export const projectsAPI = {
  getAll: (status?: string, clientId?: string) =>
    api.get('/projects', { params: { status, clientId } }),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  getStats: () => api.get('/projects/stats'),
}

// ── Logs ──────────────────────────────────────────────
export const logsAPI = {
  getAll: (page = 1, limit = 50) => api.get('/logs', { params: { page, limit } }),
}

// ── Reports ───────────────────────────────────────────
export const reportsAPI = {
  getContract: (projectId: string) =>
    api.get(`/reports/contract/${projectId}`, { responseType: 'blob' }),
  getStatistics: () => api.get('/reports/statistics'),
}

// ── AI Agent ──────────────────────────────────────────
export const aiAgentAPI = {
  analyze: (description: string) => api.post('/ai-agent/analyze', { description }),
}

export default api