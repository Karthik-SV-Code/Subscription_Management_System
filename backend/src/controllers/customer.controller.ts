import { Request, Response, NextFunction } from "express";
import { CustomerService } from "../services/customer.service";
import { sendSuccess, sendPaginated } from "../utils/response";

export class CustomerController {
  public static async getCustomers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await CustomerService.getCustomers(req.query as any);
      sendPaginated(
        res,
        result.customers,
        result.pagination,
        "Customers retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getCustomerById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      sendSuccess(res, customer, "Customer retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async createCustomer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      sendSuccess(res, customer, "Customer created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  public static async updateCustomer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body);
      sendSuccess(res, customer, "Customer updated successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async deleteCustomer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await CustomerService.deleteCustomer(req.params.id);
      sendSuccess(res, result, `Customer '${result.name}' deleted successfully`);
    } catch (error) {
      next(error);
    }
  }
}
