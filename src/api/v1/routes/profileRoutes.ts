import { ProfileController } from "../controllers/ProfileController";

export const profileRoutes = [
    {
        method: "get",
        route: "/profile",
        controller: ProfileController,
        action: "all",
    },
    {
        method: "get",
        route: "/profile/:id",
        controller: ProfileController,
        action: "one",
    },
    {
        method: "post",
        route: "/profile",

        controller: ProfileController,
        action: "add",
    },
    {
        method: "put",
        route: "/profile/:id",
        controller: ProfileController,
        action: "update",
    },
    {
        method: "delete",
        route: "/profile/:id",
        controller: ProfileController,
        action: "remove",
    },
];
