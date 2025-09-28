import { DurationController } from "../controllers/DurationController";

export const durationRoutes = [
    {
        method: "get",
        route: "/durations",
        controller: DurationController,
        action: "all",
    },
    {
        method: "get",
        route: "/durations/:id",
        controller: DurationController,
        action: "one",
    },
    {
        method: "post",
        route: "/durations",
        controller: DurationController,
        action: "add",
    },
    {
        method: "put",
        route: "/durations/:id",
        controller: DurationController,
        action: "update",
    },
    {
        method: "delete",
        route: "/durations/:id",
        controller: DurationController,
        action: "remove",
    },
];
