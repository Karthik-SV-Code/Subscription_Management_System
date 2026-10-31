import { apiClient } from "@/lib/api-client";
import { Customer, CustomerCreateInput, CustomerUpdateInput } from "@/types/customer";
import { PaginatedResponse, PaginationParams } from "@/types/common";
import { MOCK_CUSTOMERS } from "./mock-data";

const USE_MOCK =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true" ||
  !process.env.NEXT_PUBLIC_API_URL;

export const customerService = {
  /**
   * Fetch paginated customer records
   */
  async getCustomers(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<Customer>> {
    if (USE_MOCK) {
      return {
        data: MOCK_CUSTOMERS,
        total: MOCK_CUSTOMERS.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 1,
      };
    }
    return apiClient.get<PaginatedResponse<Customer>>("/customers", {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      },
    });
  },

  /**
   * Fetch customer by unique ID
   */
  async getCustomerById(id: string): Promise<Customer> {
    if (USE_MOCK) {
      const match = MOCK_CUSTOMERS.find((c) => c.id === id);
      if (!match) throw new Error(`Customer ${id} not found`);
      return match;
    }
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  /**
   * Create a new customer profile
   */
  async createCustomer(input: CustomerCreateInput): Promise<Customer> {
    return apiClient.post<Customer>("/customers", input);
  },

  /**
   * Update existing customer details
   */
  async updateCustomer(id: string, input: CustomerUpdateInput): Promise<Customer> {
    return apiClient.patch<Customer>(`/customers/${id}`, input);
  },
};

