import { apiClient } from "@/lib/api-client";
import { Invoice } from "@/types/invoice";
import { PaginatedResponse, PaginationParams } from "@/types/common";
import { MOCK_INVOICES } from "./mock-data";

const USE_MOCK =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true" ||
  !process.env.NEXT_PUBLIC_API_URL;

export const invoiceService = {
  async getInvoices(params: PaginationParams = {}): Promise<PaginatedResponse<Invoice>> {
    if (USE_MOCK) {
      return {
        data: MOCK_INVOICES,
        total: MOCK_INVOICES.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 1,
      };
    }
    return apiClient.get<PaginatedResponse<Invoice>>("/invoices", { params: { ...params } });
  },

  async getInvoiceById(id: string): Promise<Invoice> {
    if (USE_MOCK) {
      const match = MOCK_INVOICES.find((i) => i.id === id);
      if (!match) throw new Error(`Invoice ${id} not found`);
      return match;
    }
    return apiClient.get<Invoice>(`/invoices/${id}`);
  },
};

