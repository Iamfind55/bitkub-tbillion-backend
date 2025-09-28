import { WalletTypeController } from "../controllers/WalletTypeController";

export const walletTypeRoutes = [
    {
        method: "get",
        route: "/wallet-types",
        controller: WalletTypeController,
        action: "all",
    },
    {
        method: "get",
        route: "/wallet-types/:id",
        controller: WalletTypeController,
        action: "one",
    },
    {
        method: "post",
        route: "/wallet-types",
        controller: WalletTypeController,
        action: "add",
    },
    {
        method: "put",
        route: "/wallet-types/:id",
        controller: WalletTypeController,
        action: "update",
    },
    {
        method: "delete",
        route: "/wallet-types/:id",
        controller: WalletTypeController,
        action: "remove",
    },
];
