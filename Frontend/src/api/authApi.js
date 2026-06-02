import api from './axiosInstance'

export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (name, email, password, role = 'STAFF') =>
    api.post('/auth/register', { name, email, password, role }),

  // ── Forgot Password ──────────────────────────────────
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  verifyOtp: (email, otp) =>
    api.post('/auth/verify-otp', { email, otp }),

  resetPassword: (email, otp, newPassword) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),
}