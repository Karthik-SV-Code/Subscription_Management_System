import { apiClient } from "@/lib/api-client";
import { Plan } from "@/types/product";
import { PaginatedResponse, PaginationParams } from "@/types/common";
import { MOCK_PLANS } from "./mock-data";

const USE_MOCK =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true" ||
  !process.env.NEXT_PUBLIC_API_URL;

export const planService = {
  async getPlans(params: PaginationParams = {}): Promise<PaginatedResponse<Plan>> {
    if (USE_MOCK) {
      return {
        data: MOCK_PLANS,
        total: MOCK_PLANS.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 1,
      };
    }
    return apiClient.get<PaginatedResponse<Plan>>("/plans", { params: { ...params } });
  },

  async getPlanById(id: string): Promise<Plan> {
    if (USE_MOCK) {
      const match = MOCK_PLANS.find((p) => p.id === id);
      if (!match) throw new Error(`Plan ${id} not found`);
      return match;
    }
    return apiClient.get<Plan>(`/plans/${id}`);
  },
};

