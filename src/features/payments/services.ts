import { apiClient } from "@/lib/api-client";
import { Payment } from "@/types/invoice";
import { PaginatedResponse, PaginationParams } from "@/types/common";
import { MOCK_PAYMENTS } from "./mock-data";

const USE_MOCK =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true" ||
  !process.env.NEXT_PUBLIC_API_URL;

export const paymentService = {
  async getPayments(params: PaginationParams = {}): Promise<PaginatedResponse<Payment>> {
    if (USE_MOCK) {
      return {
        data: MOCK_PAYMENTS,
        total: MOCK_PAYMENTS.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 1,
      };
    }
    return apiClient.get<PaginatedResponse<Payment>>("/payments", { params: { ...params } });
  },

  async getPaymentById(id: string): Promise<Payment> {
    if (USE_MOCK) {
      const match = MOCK_PAYMENTS.find((p) => p.id === id);
      if (!match) throw new Error(`Payment ${id} not found`);
      return match;
    }
    return apiClient.get<Payment>(`/payments/${id}`);
  },
};

