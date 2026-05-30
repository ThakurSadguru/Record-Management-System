// recordApi.js — record operations ONLY (already correct, keep as-is)
import api from './axiosInstance'
export const recordApi = {
  getByModule: (moduleId, subModuleId = null) => {
    const params = { moduleId }
    if (subModuleId) params.subModuleId = subModuleId
    return api.get('/records', { params }).then(r => r.data)
  },

  search: (moduleId, q) =>
    api.get('/records/search', { params: { moduleId, q } }).then(r => r.data),

  create: (moduleId, values) =>
    api.post('/records', { moduleId, values }).then(r => r.data),

  createSubModule: (parentModuleId, subModuleId, values) =>
    api.post('/records', { moduleId: parentModuleId, subModuleId, values }).then(r => r.data),

  update: (id, values) =>
    api.put(`/records/${id}`, { values }).then(r => r.data),

  delete: (id) =>
    api.delete(`/records/${id}`),
}