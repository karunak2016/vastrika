import { apiClient } from './client'

export const uploadApi = {
  uploadImage: (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient
      .post<{ url: string }>('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.url)
  },
}
