import { api } from './api';

export interface PaymentPageOrder {
  id: number;
  status: 'pending' | 'paid' | 'cancelled' | 'expired';
  payment_method: string | null;
  total: number;
  subtotal: number;
  platform_fee: number;
  discount_amount: number;
  expires_at: string | null;
  pix_code: string | null;
  pix_qr_code: string | null;
  checkout_url: string | null;
  paid_at: string | null;
  customer: { name: string } | null;
  event: { name: string; starts_at: string; venue_name: string | null } | null;
  items: Array<{ name: string; quantity: number; unit_price: number; subtotal: number }>;
}

export const paymentPageService = {
  getOrder: (token: string) =>
    api.get<{ data: PaymentPageOrder }>(`/public/payment/${token}`),

  charge: (token: string, payload: { method: 'pix' | 'card'; phone?: string; cpf?: string }) =>
    api.post<{ data: PaymentPageOrder }>(`/public/payment/${token}/charge`, payload),
};
