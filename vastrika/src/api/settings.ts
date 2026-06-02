import { apiClient } from './client'

export const settingsApi = {
  get: (key: string): Promise<{ key: string; value: string }> =>
    apiClient.get<{ key: string; value: string }>(`/settings/${key}`).then((r) => r.data),
}
