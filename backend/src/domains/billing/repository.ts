import { and, desc, eq, gte, lte } from "drizzle-orm";

import {
  billingHistory,
  invoiceItems,
  invoices,
} from "../../../database/schemas/schema-legacy-migration";
import type {
  BillingCreateInvoiceInput,
  BillingHistoryQueryInput,
  BillingInvoiceItemInput,
  BillingInvoiceRecord,
  BillingListInvoicesInput,
} from "./types";

export async function findInvoiceById(db: any, id: number): Promise<BillingInvoiceRecord | null> {
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result[0] ?? null;
}

export async function listInvoiceItemsByInvoiceId(db: any, invoiceId: number) {
  return db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
}

export async function listInvoicesWithFilters(db: any, filters: BillingListInvoicesInput) {
  const conditions = [] as any[];

  if (filters.status) {
    conditions.push(eq(invoices.status, filters.status));
  }
  if (filters.startDate) {
    conditions.push(gte(invoices.dueDate, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(invoices.dueDate, filters.endDate));
  }

  const offset = (filters.page - 1) * filters.limit;

  return db
    .select()
    .from(invoices)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(filters.limit)
    .offset(offset)
    .orderBy(desc(invoices.createdAt));
}

export async function insertInvoiceRecord(db: any, input: BillingCreateInvoiceInput) {
  const result = await db
    .insert(invoices)
    .values({
      userId: input.userId,
      amount: String(input.amount),
      description: input.description,
      dueDate: input.dueDate,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result[0] ?? null;
}

export async function insertInvoiceItemRecords(
  db: any,
  invoiceId: number,
  items: BillingInvoiceItemInput[],
) {
  for (const item of items) {
    await db.insert(invoiceItems).values({
      invoiceId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      total: String(item.quantity * item.unitPrice),
    });
  }
}

export async function updateInvoiceRecord(db: any, id: number, data: Record<string, unknown>) {
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}

export async function insertBillingHistoryRecord(
  db: any,
  input: { invoiceId: number; action: string; performedBy: number },
) {
  await db.insert(billingHistory).values({
    invoiceId: input.invoiceId,
    action: input.action,
    performedBy: input.performedBy,
    createdAt: new Date(),
  });
}

export async function listBillingHistoryRecords(db: any, query: BillingHistoryQueryInput) {
  const offset = (query.page - 1) * query.limit;

  return db
    .select()
    .from(billingHistory)
    .where(query.invoiceId ? eq(billingHistory.invoiceId, query.invoiceId) : undefined)
    .limit(query.limit)
    .offset(offset)
    .orderBy(desc(billingHistory.createdAt));
}

export async function listAllInvoices(db: any): Promise<BillingInvoiceRecord[]> {
  return db.select().from(invoices);
}
