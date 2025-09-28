export enum UserStatus {
  INACTIVE = "inactive",
  ACTIVE = "active",
  BLOCKED = "blocked",
}

export enum CoinStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum CoinType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

export enum UserRole {
  ADMIN = "admin",
  OPERATOR = "operator",
  CUSTOMER = "customer",
}

export enum UserGender {
  FEMALE = "female",
  MALE = "male",
  OTHER = "other",
}

export enum UserProveAuth {
  VERIFIED = "verified",
  UNVERIFIED = "unverified",
}

export enum TwoFAProveAuth {
  VERIFIED = "verified",
  UNVERIFIED = "unverified",
}

export enum AccountType {
  DEMO = "demo",
  TRADING = "trading",
}

export enum AssetType {
  STOCK = "stock",
  OPTION = "option",
  FOREX = "forex",
  CRYPTO = "crypto",
}

export enum PaymentMethod {
  BANK_TRANSFER = "bank transfer",
  CREDIT_CARD = "credit card",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELED = "canceled",
  FAILED = "failed",
  REJECTED = "rejected",
}

export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  EXCHANGE = "exchange",
  TRADE = "trade",
  TRANSFER = "transfer",
  COIN = "coin",
}

export enum TradeUpDown {
  UP = "up",
  DOWN = "down",
}

export enum WithdrawStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  REJECTED = "rejected",
}

export enum TradeType {
  BTC = "btc",
  ETH = "eth",
  USD = "usd",
}

export enum CurrencyType {
  BTC = "btc",
  ETH = "eth",
  USD = "usd",
}

export enum CouponStatus {
  OPENING = "opening",
  CLOSED = "closed",
}

export enum DurationUnit {
  SECOND = "second",
  MINUTE = "minute",
  HOUR = "hour",
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export enum TradeStatus {
  // OPEN = 'open',
  // FILLED = 'filled',
  WIN = "win",
  LOST = "lost",
  PENDING = "pending",
}

export enum UnrealizedPnL {
  PROFIT = "profit",
  LOST = "lost",
}

export enum Statuses {
  INACTIVE = "inactive",
  ACTIVE = "active",
}
