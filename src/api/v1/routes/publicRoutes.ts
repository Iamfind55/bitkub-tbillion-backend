import { CouponController } from "../controllers/CouponController";

export const publicRoutes = [
    {
        method: "get",
        route: "/promotion",
        controller: CouponController,
        action: "promotion",
    }
];
