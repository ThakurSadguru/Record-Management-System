import api from './axiosInstance'

export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (name, email, password, role = 'STAFF') =>
    api.post('/auth/register', { name, email, password, role }),
}
