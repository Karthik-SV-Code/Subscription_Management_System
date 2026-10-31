import { Invoice } from "@/types/invoice";

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv_01HX9P001",
    invoiceNumber: "INV-2024-00108",
    customerId: "cust_01HX9J1Q7M001",
    customerName: "Acme Technologies Inc.",
    customerEmail: "billing@acme-tech.com",
    status: "paid",
    subtotal: 299,
    tax: 0,
    discountTotal: 0,
    total: 299,
    amountPaid: 299,
    amountDue: 0,
    currency: "USD",
    dueDate: "2024-06-15T00:00:00Z",
    paidAt: "2024-06-01T10:14:00Z",
    lineItems: [
      {
        id: "li_01",
        description: "Growth Scale - Monthly Subscription",
        amount: 299,
        quantity: 1,
        unitAmount: 299,
      },
    ],
    createdAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "inv_01HX9P002",
    invoiceNumber: "INV-2024-00109",
    customerId: "cust_01HX9J1Q7M002",
    customerName: "Nexus Cloud Dynamics",
    customerEmail: "finance@nexuscloud.io",
    status: "open",
    subtotal: 4800,
    tax: 0,
    discountTotal: 0,
    total: 4800,
    amountPaid: 0,
    amountDue: 4800,
    currency: "USD",
    dueDate: "2024-07-01T00:00:00Z",
    lineItems: [
      {
        id: "li_02",
        description: "Enterprise Dedicated - Annual Platform Contract",
        amount: 4800,
        quantity: 1,
        unitAmount: 4800,
      },
    ],
    createdAt: "2024-06-15T00:00:00Z",
  },
];

