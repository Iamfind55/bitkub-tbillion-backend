import { BankController } from "../controllers/BankController";

export const bankRoutes = [
    {
        method: "get",
        route: "/banks",
        controller: BankController,
        action: "all",
    },
    {
        method: "get",
        route: "/banks/owner",
        controller: BankController,
        action: "owner",
    },
    {
        method: "get",
        route: "/banks/:id",
        controller: BankController,
        action: "one",
    },
    {
        method: "post",
        route: "/banks",
        controller: BankController,
        action: "add",
    },
    {
        method: "put",
        route: "/banks/:id",
        controller: BankController,
        action: "update",
    },
    {
        method: "delete",
        route: "/banks/:id",
        controller: BankController,
        action: "remove",
    },
];
