import { WithdrawController } from "../controllers/WithdrawController";

export const withdrawRoutes = [
    {
        method: "get",
        route: "/withdraws",
        controller: WithdrawController,
        action: "all",
    },
    {
        method: "get",
        route: "/withdraws/pending",
        controller: WithdrawController,
        action: "withdrawPending",
    },
    {
        method: "get",
        route: "/withdraws/owner",
        controller: WithdrawController,
        action: "getWithdrawByOwnerId",
    },
    {
        method: "put",
        route: "/withdraws/edit/:id",
        controller: WithdrawController,
        action: "edit",
    },
    {
        method: "get",
        route: "/withdraws/:id",
        controller: WithdrawController,
        action: "one",
    },
    {
        method: "post",
        route: "/withdraws",
        controller: WithdrawController,
        action: "add",
    },
    {
        method: "put",
        route: "/withdraws/:id",
        controller: WithdrawController,
        action: "update",
    },
    {
        method: "delete",
        route: "/transactions/:id",
        controller: WithdrawController,
        action: "remove",
    },
];
