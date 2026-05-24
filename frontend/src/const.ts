// Application constants
export const APP_NAME = "Nexus AfilIAte-AI";
export const APP_VERSION = "1.0.0";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const TRPC_URL = import.meta.env.VITE_TRPC_URL || "http://localhost:3000/trpc";

// Helper functions
export const getLoginUrl = () => `${API_URL}/auth/login`;
export const getLogoutUrl = () => `${API_URL}/auth/logout`;
export const getDashboardUrl = () => "/dashboard";

// Role definitions
export const ROLES = {
  ADMIN: "admin",
  AFFILIATE: "affiliate",
  USER: "user",
} as const;

// Status definitions
export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  PENDING: "pending",
} as const;

// Commission statuses
export const COMMISSION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PAID: "paid",
  CANCELLED: "cancelled",
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

// Order statuses
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

// Marketplace identifiers
export const MARKETPLACES = {
  OLIST: "olist",
  MERCADO_LIVRE: "mercado_livre",
  SHOPEE: "shopee",
  AMAZON: "amazon",
} as const;