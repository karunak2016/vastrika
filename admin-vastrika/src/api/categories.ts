import { apiClient } from './client'
import type { Category } from '../types'

export const categoriesApi = {
  list: () =>
    apiClient.get<Category[]>('/categories').then((r) => r.data),

  create: (data: { name: string; description?: string }) =>
    apiClient.post<Category>('/categories', data).then((r) => r.data),

  update: (id: number, data: { name: string; description?: string }) =>
    apiClient.put<Category>(`/categories/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    apiClient.delete(`/categories/${id}`).then((r) => r.data),
}
