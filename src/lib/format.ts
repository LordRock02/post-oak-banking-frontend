const currencyFormatters = new Map<string, Intl.NumberFormat>()

export function formatCurrency(amount: number, currency = "USD") {
  let formatter = currencyFormatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", { style: "currency", currency })
    currencyFormatters.set(currency, formatter)
  }
  return formatter.format(amount)
}

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})

export function formatCompactCurrency(amount: number) {
  return compactCurrency.format(amount)
}

export function formatSignedCurrency(
  amount: number,
  type: "CREDIT" | "DEBIT",
  currency = "USD"
) {
  const formatted = formatCurrency(amount, currency)
  return type === "CREDIT" ? `+${formatted}` : `−${formatted}`
}

export function formatPercent(value: number) {
  return `${Math.abs(value).toFixed(1)}%`
}

/** First letter of up to the first two words, e.g. "Jane Doe" -> "JD". */
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/** Parses a YYYY-MM-DD string as a local date (avoids UTC off-by-one). */
export function parseISODate(date: string) {
  return new Date(`${date}T00:00:00`)
}

export function toISODate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function formatShortDate(date: string) {
  return parseISODate(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function formatLongDate(date: string) {
  return parseISODate(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
