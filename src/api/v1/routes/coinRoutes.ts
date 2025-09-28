import { CoinController } from "../controllers/CoinController";

export const coinRoutes = [
    {
        method: "get",
        route: "/coins",
        controller: CoinController,
        action: "all",
    },
    {
        method: "get",
        route: "/coins/owner",
        controller: CoinController,
        action: "getCoinByOwnerId",
    },
    {
        method: "get",
        route: "/coins/:id",
        controller: CoinController,
        action: "one",
    },
    {
        method: "put",
        route: "/coins/approve/:id",
        controller: CoinController,
        action: "approve",
    },
    {
        method: "post",
        route: "/coins",
        controller: CoinController,
        action: "add",
    },
    {
        method: "post",
        route: "/coins/withdraw",
        controller: CoinController,
        action: "withdraw",
    },
    {
        method: "put",
        route: "/coins/:id",
        controller: CoinController,
        action: "update",
    },
    {
        method: "delete",
        route: "/coins/:id",
        controller: CoinController,
        action: "remove",
    },
];
