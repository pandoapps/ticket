import { api, type ApiError } from './api';

export type RedemptionStatus = 'ok' | 'already_used' | 'invalid' | 'forbidden';

export interface RedemptionResultData {
  id: number;
  code: string;
  used_at: string | null;
  lot: { id: number; name: string };
  event: { id: number; name: string; starts_at: string; venue_name: string | null };
  customer: { id: number; name: string; email: string };
}

export interface RedemptionResult {
  status: RedemptionStatus;
  message: string;
  data?: RedemptionResultData;
}

interface ApiErrorWithData extends ApiError {
  data?: RedemptionResultData;
}

export const ticketRedemptionService = {
  async redeem(code: string): Promise<RedemptionResult> {
    try {
      return await api.post<RedemptionResult>('/producer/tickets/redeem', { code });
    } catch (err) {
      const apiErr = err as ApiErrorWithData;
      if (apiErr.status === 404) return { status: 'invalid', message: apiErr.message };
      if (apiErr.status === 403) return { status: 'forbidden', message: apiErr.message };
      if (apiErr.status === 409) {
        return { status: 'already_used', message: apiErr.message, data: apiErr.data };
      }
      throw err;
    }
  },
};
