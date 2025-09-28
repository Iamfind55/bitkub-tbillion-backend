import { TransactionController } from "../controllers/TransactionController";

export const transactionRoutes = [
    {
        method: "get",
        route: "/transactions",
        controller: TransactionController,
        action: "all",
    },
    {
        method: "get",
        route: "/transactions/withdraw-pending",
        controller: TransactionController,
        action: "withdrawPending",
    },
    {
        method: "get",
        route: "/transactions/owner",
        controller: TransactionController,
        action: "owner",
    },
    {
        method: "get",
        route: "/transactions/owner/withdraws",
        controller: TransactionController,
        action: "getWithdrawByOwnerId",
    },
    {
        method: "get",
        route: "/transactions/:id",
        controller: TransactionController,
        action: "one",
    },
    {
        method: "post",
        route: "/transactions/deposit",
        controller: TransactionController,
        action: "deposit",
    },
    {
        method: "post",
        route: "/transactions/withdraw",
        controller: TransactionController,
        action: "withdraw",
    },
    {
        method: "post",
        route: "/transactions/exchange",
        controller: TransactionController,
        action: "exchange",
    },
    {
        method: "post",
        route: "/transactions",
        controller: TransactionController,
        action: "add",
    },
    {
        method: "put",
        route: "/transactions/approve/:id",
        controller: TransactionController,
        action: "approve",
    },
    {
        method: "put",
        route: "/transactions/:id",
        controller: TransactionController,
        action: "update",
    },
    {
        method: "delete",
        route: "/transactions/:id",
        controller: TransactionController,
        action: "remove",
    },
];
