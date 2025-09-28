import { TwoFactorAuthenticatorController } from "../controllers/TwoFactorAuthenticatorController";

export const twoFactorAuthenticatorRoutes = [
    {
        method: "put",
        route: "/2fa/:id",
        controller: TwoFactorAuthenticatorController,
        action: "enabled",
    },
    {
        method: "put",
        route: "/2fa/:id",
        controller: TwoFactorAuthenticatorController,
        action: "verified",
    },
    {
        method: "delete",
        route: "/2fa/:id",
        controller: TwoFactorAuthenticatorController,
        action: "disabled",
    },
];
