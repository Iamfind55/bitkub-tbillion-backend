import { tradeRoutes } from "./tradeRoutes";
import { transactionRoutes } from "./transactionRoutes";
import { depositRoutes } from "./depositRoutes";
import { withdrawRoutes } from "./withdrawRoutes";
import { bankRoutes } from "./bankRoutes";
import { couponRoutes } from "./couponRoutes";
import { durationRoutes } from "./durationRoutes";
import { userRoutes } from "./userRoutes";
import { twoFactorAuthenticatorRoutes } from "./twoFactorAuthenticatorRoutes";
import { walletRoutes } from "./walletRoutes";
import { walletTypeRoutes } from "./walletTypeRoutes";
import { profileRoutes } from "./profileRoutes";
import { coinRoutes } from "./coinRoutes";
import { qrRoutes } from "./qrRoutes";

export const Routes = [
    ...userRoutes,
    ...walletRoutes,
    ...walletTypeRoutes,
    ...twoFactorAuthenticatorRoutes,
    ...profileRoutes,
    ...tradeRoutes,
    ...transactionRoutes,
    ...depositRoutes,
    ...withdrawRoutes,
    ...bankRoutes,
    ...couponRoutes,
    ...durationRoutes,
    ...coinRoutes,
    ...qrRoutes,
];