// api/activityApi.js
import api from './axiosInstance'

export const activityApi = {
  getRecent: (limit = 100) =>
    api.get('/activity', { params: { limit } }).then(r => r.data),
}