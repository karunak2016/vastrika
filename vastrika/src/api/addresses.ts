import { apiClient } from './client'
import type { Address, AddressRequest } from '../types'

export const addressesApi = {
  list: () =>
    apiClient.get<Address[]>('/addresses').then((r) => r.data),

  // create returns { id } not full Address
  create: (data: AddressRequest) =>
    apiClient.post<{ id: number }>('/addresses', data).then((r) => r.data),

  update: (id: number, data: AddressRequest) =>
    apiClient.put(`/addresses/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    apiClient.delete(`/addresses/${id}`).then((r) => r.data),
}
