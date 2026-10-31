import { Payment } from "@/types/invoice";

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay_01HX9R001",
    invoiceId: "inv_01HX9P001",
    invoiceNumber: "INV-2024-00108",
    customerId: "cust_01HX9J1Q7M001",
    customerName: "Acme Technologies Inc.",
    amount: 299,
    currency: "USD",
    status: "succeeded",
    paymentMethod: "credit_card",
    lastFour: "4242",
    transactionReference: "ch_3P4k8L2eZvKYlo2C1g9J4f",
    processedAt: "2024-06-01T10:14:00Z",
  },
  {
    id: "pay_01HX9R002",
    invoiceId: "inv_01HX9P002",
    invoiceNumber: "INV-2024-00109",
    customerId: "cust_01HX9J1Q7M002",
    customerName: "Nexus Cloud Dynamics",
    amount: 4800,
    currency: "USD",
    status: "pending",
    paymentMethod: "ach",
    lastFour: "6789",
    transactionReference: "ach_098K4L1123P",
    processedAt: "2024-06-15T11:00:00Z",
  },
];

