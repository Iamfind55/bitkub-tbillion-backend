import { QrController } from "../controllers/QrController";

export const qrRoutes = [
    {
        method: "get",
        route: "/qr-code",
        controller: QrController,
        action: "all",
    },
    {
        method: "get",
        route: "/qr-code/:id",
        controller: QrController,
        action: "one",
    },
    {
        method: "post",
        route: "/qr-code",
        controller: QrController,
        action: "add",
    },
    {
        method: "put",
        route: "/qr-code/:id",
        controller: QrController,
        action: "update",
    },
    {
        method: "delete",
        route: "/qr-code/:id",
        controller: QrController,
        action: "remove",
    },
];
