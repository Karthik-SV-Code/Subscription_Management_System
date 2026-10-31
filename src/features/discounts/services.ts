import { apiClient } from "@/lib/api-client";
import { Discount, DiscountCreateInput } from "./types";
import { PaginatedResponse, PaginationParams } from "@/types/common";
import { MOCK_DISCOUNTS } from "./mock-data";

const USE_MOCK =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true" ||
  !process.env.NEXT_PUBLIC_API_URL;

export const discountService = {
  async getDiscounts(params: PaginationParams = {}): Promise<PaginatedResponse<Discount>> {
    if (USE_MOCK) {
      return {
        data: MOCK_DISCOUNTS,
        total: MOCK_DISCOUNTS.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 1,
      };
    }
    return apiClient.get<PaginatedResponse<Discount>>("/discounts", { params: { ...params } });
  },

  async createDiscount(input: DiscountCreateInput): Promise<Discount> {
    return apiClient.post<Discount>("/discounts", input);
  },
};

