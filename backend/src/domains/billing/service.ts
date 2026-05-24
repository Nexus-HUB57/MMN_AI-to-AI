import {
  publishInvoiceOverdue,
  publishInvoicePaid,
  publishPaymentProcessed,
} from "./events";
import type {
  BillingConfirmPaymentInput,
  BillingCreateInvoiceInput,
  BillingHistoryQueryInput,
  BillingInvoiceRecord,
  BillingListInvoicesInput,
  BillingStatsView,
  BillingUpdateInvoiceStatusInput,
} from "./types";

export class InvoiceNotFoundError extends Error {
  constructor() {
    super("Fatura não encontrada");
    this.name = "InvoiceNotFoundError";
  }
}

export interface BillingServiceDeps {
  findInvoiceById: (id: number) => Promise<BillingInvoiceRecord | null>;
  listInvoiceItemsByInvoiceId: (invoiceId: number) => Promise<any[]>;
  listInvoicesWithFilters: (filters: BillingListInvoicesInput) => Promise<BillingInvoiceRecord[]>;
  insertInvoiceRecord: (input: BillingCreateInvoiceInput) => Promise<BillingInvoiceRecord | null>;
  insertInvoiceItemRecords: (invoiceId: number, items: NonNullable<BillingCreateInvoiceInput["items"]>) => Promise<void>;
  updateInvoiceRecord: (id: number, data: Record<string, unknown>) => Promise<void>;
  insertBillingHistoryRecord: (input: {
    invoiceId: number;
    action: string;
    performedBy: number;
  }) => Promise<void>;
  listBillingHistoryRecords: (query: BillingHistoryQueryInput) => Promise<any[]>;
  listAllInvoices: () => Promise<BillingInvoiceRecord[]>;
}

function toAmount(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

export async function getInvoiceDetails(
  id: number,
  deps: BillingServiceDeps,
) {
  const invoice = await deps.findInvoiceById(id);
  if (!invoice) {
    throw new InvoiceNotFoundError();
  }

  const items = await deps.listInvoiceItemsByInvoiceId(id);
  return {
    ...invoice,
    items,
  };
}

export async function listInvoices(
  input: BillingListInvoicesInput,
  deps: BillingServiceDeps,
) {
  const invoices = await deps.listInvoicesWithFilters(input);

  return {
    invoices,
    page: input.page,
    limit: input.limit,
  };
}

export async function createInvoice(
  input: BillingCreateInvoiceInput,
  deps: BillingServiceDeps,
) {
  const invoice = await deps.insertInvoiceRecord(input);
  if (!invoice) {
    throw new Error("Falha ao criar fatura");
  }

  if (input.items && input.items.length > 0) {
    await deps.insertInvoiceItemRecords(invoice.id, input.items);
  }

  return {
    success: true,
    invoice,
  };
}

export async function updateInvoiceStatus(
  input: BillingUpdateInvoiceStatusInput,
  deps: BillingServiceDeps,
) {
  const invoice = await deps.findInvoiceById(input.id);
  if (!invoice) {
    throw new InvoiceNotFoundError();
  }

  const updateData: Record<string, unknown> = {
    status: input.status,
    updatedAt: new Date(),
  };

  if (input.paidAt) {
    updateData.paidAt = input.paidAt;
  }

  await deps.updateInvoiceRecord(input.id, updateData);
  await deps.insertBillingHistoryRecord({
    invoiceId: input.id,
    action: `Status alterado para ${input.status}`,
    performedBy: input.performedBy,
  });

  if (input.status === "paid") {
    await publishInvoicePaid(
      {
        invoiceId: String(invoice.id),
        userId: String(invoice.userId),
        amount: toAmount(invoice.amount),
        currency: "BRL",
        paymentMethod: "manual_status_update",
      },
      {
        source: "billing.updateInvoiceStatus",
        performedBy: input.performedBy,
      },
    );
  }

  if (input.status === "overdue") {
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date();
    const diffMs = Date.now() - dueDate.getTime();
    const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    await publishInvoiceOverdue(
      String(invoice.id),
      String(invoice.userId),
      toAmount(invoice.amount),
      daysOverdue,
      {
        source: "billing.updateInvoiceStatus",
        performedBy: input.performedBy,
      },
    );
  }

  return { success: true };
}

export async function getBillingHistory(
  input: BillingHistoryQueryInput,
  deps: BillingServiceDeps,
) {
  const history = await deps.listBillingHistoryRecords(input);

  return {
    history,
    page: input.page,
    limit: input.limit,
  };
}

export async function getBillingStats(
  deps: BillingServiceDeps,
): Promise<BillingStatsView> {
  const allInvoices = await deps.listAllInvoices();

  return {
    total: allInvoices.length,
    pending: allInvoices.filter((invoice) => invoice.status === "pending").length,
    paid: allInvoices.filter((invoice) => invoice.status === "paid").length,
    overdue: allInvoices.filter((invoice) => invoice.status === "overdue").length,
    cancelled: allInvoices.filter((invoice) => invoice.status === "cancelled").length,
    totalAmount: allInvoices.reduce((sum, invoice) => sum + toAmount(invoice.amount), 0),
    paidAmount: allInvoices
      .filter((invoice) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + toAmount(invoice.amount), 0),
    pendingAmount: allInvoices
      .filter((invoice) => invoice.status === "pending")
      .reduce((sum, invoice) => sum + toAmount(invoice.amount), 0),
  };
}

export async function confirmInvoicePayment(
  input: BillingConfirmPaymentInput,
  deps: BillingServiceDeps,
) {
  const invoice = await deps.findInvoiceById(input.invoiceId);
  if (!invoice) {
    throw new InvoiceNotFoundError();
  }

  await deps.updateInvoiceRecord(input.invoiceId, {
    status: "paid",
    paidAt: new Date(),
    updatedAt: new Date(),
  });

  await deps.insertBillingHistoryRecord({
    invoiceId: input.invoiceId,
    action: `Pagamento confirmado: ${input.paymentId}`,
    performedBy: 0,
  });

  await publishInvoicePaid(
    {
      invoiceId: String(invoice.id),
      userId: String(invoice.userId),
      amount: input.amount,
      currency: "BRL",
      paymentMethod: "gateway_callback",
      transactionId: input.paymentId,
    },
    {
      source: "billing.confirmPayment",
    },
  );

  await publishPaymentProcessed(
    input.paymentId,
    String(invoice.userId),
    input.amount,
    "gateway_callback",
    {
      source: "billing.confirmPayment",
      invoiceId: input.invoiceId,
    },
  );

  return { success: true };
}
