import api from './axiosInstance'

export const userApi = {
  getAll: () =>
    api.get('/users').then(r => r.data),

  update: (id, data) =>
    api.put(`/users/${id}`, data).then(r => r.data),

  delete: (id) =>
    api.delete(`/users/${id}`),
}
