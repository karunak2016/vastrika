import { apiClient } from './client'
import type { Cart, AddToCartRequest } from '../types'

export const cartApi = {
  get: () =>
    apiClient.get<Cart>('/cart').then((r) => r.data),

  addItem: (data: AddToCartRequest) =>
    apiClient.post<Cart>('/cart/items', data).then((r) => r.data),

  // API takes a raw int in the body, not an object
  updateItem: (id: number, quantity: number) =>
    apiClient.put<Cart>(`/cart/items/${id}`, quantity).then((r) => r.data),

  removeItem: (id: number) =>
    apiClient.delete<Cart>(`/cart/items/${id}`).then((r) => r.data),

  clear: () =>
    apiClient.delete('/cart'),
}
