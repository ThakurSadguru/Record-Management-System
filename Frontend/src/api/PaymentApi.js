import api from './axiosInstance';

export const paymentApi = {
  createOrder: (plan, yearly) =>
    api.post('/payment/create-order', { plan, yearly }),

  verify: (razorpayOrderId, razorpayPaymentId, razorpaySignature, plan, yearly) =>
    api.post('/payment/verify', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      plan,
      yearly,
    }),
};