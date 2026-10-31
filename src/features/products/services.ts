import { apiClient } from "@/lib/api-client";
import { Product, ProductCreateInput } from "@/types/product";
import { PaginatedResponse, PaginationParams } from "@/types/common";
import { MOCK_PRODUCTS } from "./mock-data";

const USE_MOCK =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true" ||
  !process.env.NEXT_PUBLIC_API_URL;

export const productService = {
  /**
   * Fetch all product catalog entries
   */
  async getProducts(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<Product>> {
    if (USE_MOCK) {
      return {
        data: MOCK_PRODUCTS,
        total: MOCK_PRODUCTS.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 1,
      };
    }
    return apiClient.get<PaginatedResponse<Product>>("/products", {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      },
    });
  },

  /**
   * Fetch product by ID
   */
  async getProductById(id: string): Promise<Product> {
    if (USE_MOCK) {
      const match = MOCK_PRODUCTS.find((p) => p.id === id);
      if (!match) throw new Error(`Product ${id} not found`);
      return match;
    }
    return apiClient.get<Product>(`/products/${id}`);
  },

  /**
   * Create a new product entry
   */
  async createProduct(input: ProductCreateInput): Promise<Product> {
    return apiClient.post<Product>("/products", input);
  },
};

