/**
 * Maps raw backend payloads into the frontend's domain types. Every field is
 * treated as untrusted: missing, null or malformed values fall back to safe
 * defaults, and records without an id are dropped, so one bad row can never
 * crash the dashboard.
 */
import { toISODate } from "@/lib/format"
import type { Account, AccountType, Transaction, TransactionStatus, TransactionType } from "@/types"

/** GET /api/v1/accounts/user/{userId} item, as serialized by Spring. */
export interface RawAccount {
  id?: string | null
  userId?: string | null
  accountNumber?: string | null
  name?: string | null
  balance?: number | string | null
  currency?: string | null
  createdAt?: string | number[] | null
}

/** GET /api/v1/transactions/account/{accountId} item, as serialized by Spring. */
export interface RawTransaction {
  id?: string | null
  accountId?: string | null
  amount?: number | string | null
  type?: string | null
  category?: string | null
  merchantName?: string | null
  /** COMPLETED | PENDING | FAILED */
  status?: string | null
  /** LocalDateTime, e.g. "2026-11-06T10:15:30.123". */
  createdAt?: string | number[] | null
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/
const CURRENCY_CODE = /^[A-Z]{3}$/

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")

/** Accepts numbers and numeric strings (BigDecimal may serialize as either). */
function toAmount(value: unknown): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}

/** Intl.NumberFormat throws on malformed codes, so only pass well-formed ones through. */
function toCurrency(value: unknown) {
  const code = text(value).toUpperCase()
  return CURRENCY_CODE.test(code) ? code : "USD"
}

/**
 * Normalizes a LocalDateTime (ISO string, or Jackson's [y, m, d, h, min, s]
 * array form) to a sortable ISO timestamp. Returns null if unparseable.
 */
function toTimestamp(value: unknown): string | null {
  if (typeof value === "string" && ISO_DATE.test(value)) return value
  if (Array.isArray(value) && value.length >= 3 && value.every((v) => typeof v === "number")) {
    const [y, m, d, h = 0, min = 0, s = 0] = value as number[]
    const date = new Date(y, m - 1, d, h, min, s)
    if (Number.isNaN(date.getTime())) return null
    return `${toISODate(date)}T${[h, min, s].map((v) => String(v).padStart(2, "0")).join(":")}`
  }
  return null
}

function toAccountType(name: string): AccountType {
  return /saving|ahorro/i.test(name) ? "SAVINGS" : "CHECKING"
}

function toTransactionStatus(value: unknown): TransactionStatus {
  switch (text(value).toUpperCase()) {
    case "PENDING":
      return "PENDING"
    case "FAILED":
    case "REJECTED":
    case "CANCELLED":
    case "CANCELED":
      return "FAILED"
    default:
      return "POSTED" // COMPLETED, POSTED, or unknown
  }
}

function toTransactionType(value: unknown, rawAmount: number): TransactionType {
  const type = text(value).toUpperCase()
  if (type === "CREDIT" || type === "DEBIT") return type
  return rawAmount < 0 ? "DEBIT" : "CREDIT"
}

export function toAccount(raw: RawAccount | null | undefined): Account | null {
  const id = text(raw?.id)
  if (!id) return null
  const name = text(raw?.name) || "Account"
  // e.g. "ACC-D995C46B" -> "C46B": keep the real tail, not just its digits.
  const accountNumber = text(raw?.accountNumber).replace(/[^0-9a-z]/gi, "")
  return {
    id,
    userId: text(raw?.userId),
    name,
    type: toAccountType(name),
    balance: toAmount(raw?.balance),
    currency: toCurrency(raw?.currency),
    lastFour: (accountNumber || id.replace(/[^0-9a-z]/gi, "")).slice(-4).toUpperCase(),
  }
}

export function toTransaction(
  raw: RawTransaction | null | undefined,
  fallbackAccountId: string
): Transaction | null {
  const id = text(raw?.id)
  if (!id) return null
  const signedAmount = toAmount(raw?.amount)
  // Backend sets createdAt on every insert; "now" is a last-resort fallback.
  const createdAt = toTimestamp(raw?.createdAt) ?? new Date().toISOString()
  return {
    id,
    accountId: text(raw?.accountId) || fallbackAccountId,
    amount: Math.abs(signedAmount),
    type: toTransactionType(raw?.type, signedAmount),
    category: text(raw?.category) || "Other",
    merchantName: text(raw?.merchantName) || "Unknown merchant",
    status: toTransactionStatus(raw?.status),
    date: createdAt.slice(0, 10),
    createdAt,
    // The backend has no human-readable reference; derive a stable one from the id.
    reference: `PO-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
  }
}

/** Maps a list response, tolerating a non-array body and dropping invalid rows. */
export function mapList<Raw, T>(data: unknown, map: (raw: Raw) => T | null): T[] {
  if (!Array.isArray(data)) return []
  return data.map((item) => map(item as Raw)).filter((item): item is T => item !== null)
}
