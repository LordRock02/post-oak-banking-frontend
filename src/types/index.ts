export interface Account {
  id: string
  userId: string
  name: string
  balance: number
  currency: string
}

export interface Transaction {
  id: string
  accountId: string
  amount: number
  type: "CREDIT" | "DEBIT"
  category: string
  merchantName: string
  status: string
  date: string
}
