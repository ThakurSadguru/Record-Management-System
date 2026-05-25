import api from './axiosInstance'

export const recordApi = {
  getByModule: (moduleId) =>
    api.get('/records', { params: { moduleId } }).then(r => r.data),

  search: (moduleId, q) =>
    api.get('/records/search', { params: { moduleId, q } }).then(r => r.data),

  create: (moduleId, values) =>
    api.post('/records', { moduleId, values }).then(r => r.data),

  update: (id, values) =>
    api.put(`/records/${id}`, { values }).then(r => r.data),

  delete: (id) =>
    api.delete(`/records/${id}`),
}