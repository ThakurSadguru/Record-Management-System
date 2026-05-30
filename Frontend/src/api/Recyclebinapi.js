import api from './axiosInstance'

export const recycleBinApi = {
  // GET all deleted items (modules + records)
  getAll: () =>
    api.get('/recycle-bin').then(r => r.data),

  // Restore a deleted module
  restoreModule: (id) =>
    api.post(`/recycle-bin/modules/${id}/restore`).then(r => r.data),

  // Permanently delete a module
  purgeModule: (id) =>
    api.delete(`/recycle-bin/modules/${id}`),

  // Restore a deleted record
  restoreRecord: (id) =>
    api.post(`/recycle-bin/records/${id}/restore`).then(r => r.data),

  // Permanently delete a record
  purgeRecord: (id) =>
    api.delete(`/recycle-bin/records/${id}`),
}