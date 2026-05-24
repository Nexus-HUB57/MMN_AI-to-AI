import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  InvoiceNotFoundError,
  confirmInvoicePayment,
  createInvoice,
  getBillingHistory,
  getBillingStats,
  getInvoiceDetails,
  listInvoices,
  updateInvoiceStatus,
} from "../../backend/src/domains/billing/service";
import {
  DomainEventType,
  eventBus,
} from "../../backend/src/_core/events/eventBus";

function buildDeps(overrides: Record<string, unknown> = {}) {
  const invoice = {
    id: 10,
    userId: 5,
    amount: "1500",
    description: "Mensalidade",
    status: "pending",
    dueDate: new Date("2026-05-20T00:00:00.000Z"),
    paidAt: null,
    createdAt: new Date("2026-05-01T00:00:00.000Z"),
    updatedAt: new Date("2026-05-01T00:00:00.000Z"),
  };

  const insertedItems: any[] = [];
  const historyWrites: any[] = [];

  const deps = {
    findInvoiceById: vi.fn(async (id: number) => (id === invoice.id ? invoice : null)),
    listInvoiceItemsByInvoiceId: vi.fn(async () => [
      {
        id: 1,
        invoiceId: invoice.id,
        description: "Plano base",
        quantity: 1,
        unitPrice: "1500",
        total: "1500",
        createdAt: new Date("2026-05-01T00:00:00.000Z"),
      },
    ]),
    listInvoicesWithFilters: vi.fn(async () => [invoice]),
    insertInvoiceRecord: vi.fn(async (input: any) => ({
      ...invoice,
      id: 11,
      userId: input.userId,
      amount: String(input.amount),
      description: input.description,
      dueDate: input.dueDate,
    })),
    insertInvoiceItemRecords: vi.fn(async (_invoiceId: number, items: any[]) => {
      insertedItems.push(...items);
    }),
    updateInvoiceRecord: vi.fn(async () => undefined),
    insertBillingHistoryRecord: vi.fn(async (input: any) => {
      historyWrites.push(input);
    }),
    listBillingHistoryRecords: vi.fn(async () => [
      {
        id: 1,
        invoiceId: invoice.id,
        action: "Status alterado para paid",
        performedBy: 1,
        createdAt: new Date("2026-05-24T00:00:00.000Z"),
      },
    ]),
    listAllInvoices: vi.fn(async () => [
      invoice,
      { ...invoice, id: 12, status: "paid", amount: "2000" },
      { ...invoice, id: 13, status: "overdue", amount: "500" },
      { ...invoice, id: 14, status: "cancelled", amount: "300" },
    ]),
  };

  return {
    invoice,
    insertedItems,
    historyWrites,
    deps: {
      ...deps,
      ...overrides,
    },
  };
}

describe("billing domain service", () => {
  let publishedTypes: string[];
  let subscriptionIds: string[];

  beforeEach(() => {
    publishedTypes = [];
    subscriptionIds = [
      eventBus.subscribe(DomainEventType.INVOICE_PAID, (event) => {
        publishedTypes.push(event.type);
      }),
      eventBus.subscribe(DomainEventType.INVOICE_OVERDUE, (event) => {
        publishedTypes.push(event.type);
      }),
      eventBus.subscribe(DomainEventType.PAYMENT_PROCESSED, (event) => {
        publishedTypes.push(event.type);
      }),
    ];
  });

  afterEach(() => {
    subscriptionIds.forEach((id) => eventBus.unsubscribe(id));
    vi.clearAllMocks();
  });

  it("retorna fatura com itens", async () => {
    const { deps } = buildDeps();
    const result = await getInvoiceDetails(10, deps as any);

    expect(result.id).toBe(10);
    expect(result.items).toHaveLength(1);
  });

  it("lista faturas com paginação preservada", async () => {
    const { deps } = buildDeps();
    const result = await listInvoices(
      {
        status: "pending",
        page: 2,
        limit: 15,
      },
      deps as any,
    );

    expect(result.page).toBe(2);
    expect(result.limit).toBe(15);
    expect(result.invoices).toHaveLength(1);
  });

  it("cria fatura e registra itens quando enviados", async () => {
    const { deps, insertedItems } = buildDeps();
    const result = await createInvoice(
      {
        userId: 5,
        amount: 2500,
        description: "Setup",
        dueDate: new Date("2026-06-01T00:00:00.000Z"),
        items: [
          {
            description: "Onboarding",
            quantity: 1,
            unitPrice: 2500,
          },
        ],
      },
      deps as any,
    );

    expect(result.success).toBe(true);
    expect(result.invoice.id).toBe(11);
    expect(insertedItems).toHaveLength(1);
  });

  it("atualiza status para paid/overdue e publica eventos", async () => {
    const { deps, historyWrites } = buildDeps();

    await updateInvoiceStatus(
      {
        id: 10,
        status: "paid",
        performedBy: 99,
      },
      deps as any,
    );

    await updateInvoiceStatus(
      {
        id: 10,
        status: "overdue",
        performedBy: 99,
      },
      deps as any,
    );

    expect(historyWrites).toHaveLength(2);
    expect(publishedTypes).toEqual(
      expect.arrayContaining(["InvoicePaid", "InvoiceOverdue"]),
    );
  });

  it("retorna histórico e estatísticas agregadas", async () => {
    const { deps } = buildDeps();

    const history = await getBillingHistory(
      {
        invoiceId: 10,
        page: 1,
        limit: 20,
      },
      deps as any,
    );
    const stats = await getBillingStats(deps as any);

    expect(history.history).toHaveLength(1);
    expect(stats).toMatchObject({
      total: 4,
      pending: 1,
      paid: 1,
      overdue: 1,
      cancelled: 1,
      totalAmount: 4300,
      paidAmount: 2000,
      pendingAmount: 1500,
    });
  });

  it("confirma pagamento e publica eventos de invoice/payment", async () => {
    const { deps, historyWrites } = buildDeps();

    const result = await confirmInvoicePayment(
      {
        invoiceId: 10,
        paymentId: "pay_123",
        amount: 1500,
      },
      deps as any,
    );

    expect(result).toEqual({ success: true });
    expect(historyWrites.at(-1)).toMatchObject({
      action: "Pagamento confirmado: pay_123",
    });
    expect(publishedTypes).toEqual(
      expect.arrayContaining(["InvoicePaid", "PaymentProcessed"]),
    );
  });

  it("lança erro tipado quando a fatura não existe", async () => {
    const { deps } = buildDeps({
      findInvoiceById: vi.fn(async () => null),
    });

    await expect(getInvoiceDetails(999, deps as any)).rejects.toBeInstanceOf(
      InvoiceNotFoundError,
    );
  });
});
