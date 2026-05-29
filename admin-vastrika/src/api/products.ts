import { apiClient } from './client'
import type { Product, ProductRequest } from '../types'

export const productsApi = {
  list: () =>
    apiClient.get<{ items: Product[] }>('/products', { params: { pageSize: 500 } }).then((r) => r.data.items),

  getById: (id: number) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (data: ProductRequest) =>
    apiClient.post<Product>('/products', data).then((r) => r.data),

  update: (id: number, data: ProductRequest) =>
    apiClient.put<Product>(`/products/${id}`, data).then((r) => r.data),

  deactivate: (id: number) =>
    apiClient.delete(`/products/${id}`).then((r) => r.data),

  addImage: (productId: number, imageUrl: string, isDefault: boolean): Promise<number> =>
    apiClient.post<{ imageId: number }>(`/products/${productId}/images`, { imageUrl, isDefault }).then((r) => r.data.imageId),

  removeImage: (productId: number, imageId: number) =>
    apiClient.delete(`/products/${productId}/images/${imageId}`).then((r) => r.data),
}
