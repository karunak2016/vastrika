import { apiClient } from './client'

export interface ProductOption {
  id: number
  type: string
  value: string
  displayOrder: number
}

export const optionsApi = {
  getFabrics: (): Promise<ProductOption[]> =>
    apiClient.get<ProductOption[]>('/options/fabrics').then((r) => r.data),

  getColors: (): Promise<ProductOption[]> =>
    apiClient.get<ProductOption[]>('/options/colors').then((r) => r.data),

  createFabric: (value: string): Promise<ProductOption> =>
    apiClient.post<ProductOption>('/options/fabrics', { value }).then((r) => r.data),

  createColor: (value: string): Promise<ProductOption> =>
    apiClient.post<ProductOption>('/options/colors', { value }).then((r) => r.data),

  updateFabric: (id: number, value: string): Promise<ProductOption> =>
    apiClient.post<ProductOption>(`/options/fabrics/update/${id}`, { value }).then((r) => r.data),

  updateColor: (id: number, value: string): Promise<ProductOption> =>
    apiClient.post<ProductOption>(`/options/colors/update/${id}`, { value }).then((r) => r.data),

  deleteFabric: (id: number): Promise<void> =>
    apiClient.post(`/options/fabrics/delete/${id}`).then(() => undefined),

  deleteColor: (id: number): Promise<void> =>
    apiClient.post(`/options/colors/delete/${id}`).then(() => undefined),
}
