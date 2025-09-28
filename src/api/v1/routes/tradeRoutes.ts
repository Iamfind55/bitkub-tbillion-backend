import { TradeController } from "../controllers/TradeController";
// import { SocketMiddleware } from "../middleware/socket";

export const tradeRoutes = [
    {
        method: "get",
        route: "/trades",
        controller: TradeController,
        action: "all",
    },
    {
        method: "get",
        route: "/trades/trading",
        controller: TradeController,
        action: "trading",
    },
    {
        method: "get",
        route: "/trades/owner",
        controller: TradeController,
        action: "owner",
    },
    {
        method: "get",
        route: "/trades/owner/trades",
        controller: TradeController,
        action: "getTradesByOwnerId",
    },
    {
        method: "get",
        route: "/trades/owner/last-trade",
        controller: TradeController,
        action: "getLastTradeByOwnerId",
    },
    {
        method: "get",
        route: "/trades/:id",
        controller: TradeController,
        action: "one",
    },
    {
        method: "post",
        route: "/trades",
        controller: TradeController,
        action: "add",
    },
    {
        method: "post",
        route: "/trades/pending",
        controller: TradeController,
        action: "pending",
    },
    {
        method: "put",
        route: "/trades/approve/:id",
        controller: TradeController,
        action: "approve",
    },
    {
        method: "put",
        route: "/trades/transfer/:id",
        controller: TradeController,
        action: "transfer",
    },
    {
        method: "put",
        route: "/trades/:id",
        controller: TradeController,
        action: "update",
    },
    {
        method: "delete",
        route: "/trades/:id",
        controller: TradeController,
        action: "remove",
    },
];
