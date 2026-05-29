import { apiClient } from './client'
import type { Category } from '../types'

export const categoriesApi = {
  list: () =>
    apiClient.get<Category[]>('/categories').then((r) => r.data),

  create: (data: { name: string; description?: string }) =>
    apiClient.post<Category>('/categories', data).then((r) => r.data),

  update: (id: number, data: { name: string; description?: string }) =>
    apiClient.post<Category>(`/categories/update/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    apiClient.post(`/categories/delete/${id}`).then((r) => r.data),
}
