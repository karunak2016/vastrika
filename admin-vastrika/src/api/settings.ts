import { apiClient } from './client'

export const settingsApi = {
  get: (key: string): Promise<{ key: string; value: string }> =>
    apiClient.get<{ key: string; value: string }>(`/settings/${key}`).then((r) => r.data),

  set: (key: string, value: string): Promise<{ key: string; value: string }> =>
    apiClient.put<{ key: string; value: string }>(`/settings/${key}`, { value }).then((r) => r.data),
}
