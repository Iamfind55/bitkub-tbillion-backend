import { AuthController } from "../controllers/AuthController";
import { validateUser } from "../validations/validateUser";

export const authRoutes = [
    {
        validateUser,
        method: "post",
        route: "/signup",
        controller: AuthController,
        action: "signup",
    },
    {
        method: "post",
        route: "/login",
        controller: AuthController,
        action: "login",
    },
    {
        method: "post",
        route: "/forgot-password",
        controller: AuthController,
        action: "forgotPassword",
    },
    {
        method: "post",
        route: "/reset-password",
        controller: AuthController,
        action: "resetPassword",
    },
    {
        method: "post",
        route: "/request",
        controller: AuthController,
        action: "authRequest",
    },
    {
        method: "post",
        route: "/verify",
        controller: AuthController,
        action: "verifyAuthentication",
    },
    {
        method: "post",
        route: "/refreshToken",
        controller: AuthController,
        action: "refreshToken",
    },
];
