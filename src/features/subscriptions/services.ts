import { apiClient } from "@/lib/api-client";
import { Subscription, SubscriptionCreateInput } from "@/types/subscription";
import { PaginatedResponse, PaginationParams } from "@/types/common";
import { MOCK_SUBSCRIPTIONS } from "./mock-data";

const USE_MOCK =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true" ||
  !process.env.NEXT_PUBLIC_API_URL;

export const subscriptionService = {
  async getSubscriptions(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<Subscription>> {
    if (USE_MOCK) {
      return {
        data: MOCK_SUBSCRIPTIONS,
        total: MOCK_SUBSCRIPTIONS.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 1,
      };
    }
    return apiClient.get<PaginatedResponse<Subscription>>("/subscriptions", {
      params: { ...params },
    });
  },

  async getSubscriptionById(id: string): Promise<Subscription> {
    if (USE_MOCK) {
      const match = MOCK_SUBSCRIPTIONS.find((s) => s.id === id);
      if (!match) throw new Error(`Subscription ${id} not found`);
      return match;
    }
    return apiClient.get<Subscription>(`/subscriptions/${id}`);
  },

  async createSubscription(input: SubscriptionCreateInput): Promise<Subscription> {
    return apiClient.post<Subscription>("/subscriptions", input);
  },

  async cancelSubscription(id: string, atPeriodEnd: boolean = true): Promise<Subscription> {
    return apiClient.post<Subscription>(`/subscriptions/${id}/cancel`, { atPeriodEnd });
  },
};

