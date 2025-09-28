import { CouponController } from "../controllers/CouponController";

export const couponRoutes = [
    {
        method: "get",
        route: "/coupons",
        controller: CouponController,
        action: "all",
    },
    {
        method: "get",
        route: "/coupons/:id",
        controller: CouponController,
        action: "one",
    },
    {
        method: "post",
        route: "/coupons",
        controller: CouponController,
        action: "add",
    },
    {
        method: "put",
        route: "/coupons/:id",
        controller: CouponController,
        action: "update",
    },
    {
        method: "delete",
        route: "/coupons/:id",
        controller: CouponController,
        action: "remove",
    },
];
