import "reflect-metadata";
import { DataSource } from "typeorm";
import { Users } from "../api/v1/entities/Users";
import { Transactions } from "../api/v1/entities/Transactions";
import { Trades } from "../api/v1/entities/Trades";
import { Banks } from "../api/v1/entities/Banks";
import { Durations } from "../api/v1/entities/Durations";
import { Coupons } from "../api/v1/entities/Coupons";
import { Wallets } from "../api/v1/entities/Wallets";
import { TwoFactorAuthenticator } from "../api/v1/entities/TwoFactorAuthenticator";
import { Profiles } from "../api/v1/entities/Profiles";
import { WalletTypes } from "../api/v1/entities/WalletTypes";
import dotenv from 'dotenv';
import { Withdraws } from "../api/v1/entities/Withdraws";
import { Coins } from "../api/v1/entities/Coins";
import { QrCodes } from "../api/v1/entities/QrCodes";
dotenv.config();
export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  synchronize: true,
  logging: false,
  entities: [
    Users,
    Wallets,
    WalletTypes,
    Transactions,
    Trades,
    Withdraws,
    Banks,
    Durations,
    Coupons,
    TwoFactorAuthenticator,
    Profiles,
    Coins,
    QrCodes
  ],
  migrations: [],
  subscribers: [],
});
