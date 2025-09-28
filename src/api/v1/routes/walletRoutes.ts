import { WalletController } from "../controllers/WalletController";

export const walletRoutes = [
    {
        method: "get",
        route: "/wallets",
        controller: WalletController,
        action: "all",
    },
    {
        method: "get",
        route: "/wallets/account",
        controller: WalletController,
        action: "wallet",
    },
    {
        method: "get",
        route: "/wallets/owner",
        controller: WalletController,
        action: "owner",
    },
    {
        method: "get",
        route: "/wallets/:id",
        controller: WalletController,
        action: "one",
    },
    {
        method: "post",
        route: "/wallets",
        controller: WalletController,
        action: "add",
    },
    {
        method: "put",
        route: "/wallets/:id",
        controller: WalletController,
        action: "update",
    },
    {
        method: "delete",
        route: "/wallets/:id",
        controller: WalletController,
        action: "remove",
    },
];
