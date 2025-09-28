import { DepositController } from "../controllers/DepositController";

export const depositRoutes = [
  {
    method: "get",
    route: "/deposits",
    controller: DepositController,
    action: "all",
  },
  {
    method: "get",
    route: "/deposits/owner",
    controller: DepositController,
    action: "getDepositByOwnerId",
  },
  {
    method: "get",
    route: "/deposits/:id",
    controller: DepositController,
    action: "one",
  },
  {
    method: "post",
    route: "/deposits",
    controller: DepositController,
    action: "add",
  },
  {
    method: "delete",
    route: "/deposits/:id",
    controller: DepositController,
    action: "remove",
  },
  {
    method: "put",
    route: "/deposits",
    controller: DepositController,
    action: "updateDiposit",
  },
];
