import type {
  BillingHistory,
  Invoice,
  InvoiceItem,
} from "../../../database/schemas/schema-legacy-migration";

export type BillingInvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface BillingInvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface BillingListInvoicesInput {
  status?: BillingInvoiceStatus;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
}

export interface BillingCreateInvoiceInput {
  userId: number;
  amount: number;
  description: string;
  dueDate: Date;
  items?: BillingInvoiceItemInput[];
}

export interface BillingUpdateInvoiceStatusInput {
  id: number;
  status: BillingInvoiceStatus;
  paidAt?: Date;
  performedBy: number;
}

export interface BillingConfirmPaymentInput {
  invoiceId: number;
  paymentId: string;
  amount: number;
}

export interface BillingHistoryQueryInput {
  invoiceId?: number;
  page: number;
  limit: number;
}

export interface BillingStatsView {
  total: number;
  pending: number;
  paid: number;
  overdue: number;
  cancelled: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export type BillingInvoiceRecord = Invoice;
export type BillingInvoiceItemRecord = InvoiceItem;
export type BillingHistoryRecord = BillingHistory;
