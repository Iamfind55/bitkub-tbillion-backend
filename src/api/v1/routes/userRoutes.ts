import { UserController } from "../controllers/UserController";

export const userRoutes = [
  {
    method: "get",
    route: "/users",
    controller: UserController,
    action: "all",
  },
  {
    method: "get",
    route: "/users/owner",
    controller: UserController,
    action: "owner",
  },
  {
    method: "put",
    route: "/users/profile/:id",
    controller: UserController,
    action: "profile",
  },
  {
    method: "put",
    route: "/users/approve/:id",
    controller: UserController,
    action: "approve",
  },
  {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one",
  },
  {
    method: "post",
    route: "/users",
    controller: UserController,
    action: "add",
  },
  {
    method: "put",
    route: "/users/:id",
    controller: UserController,
    action: "update",
  },
  {
    method: "post",
    route: "/users/change-password",
    controller: UserController,
    action: "changePassword",
  },
  {
    method: "post",
    route: "/users/change-customer-password",
    controller: UserController,
    action: "changeCustomerPassword",
  },
  {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove",
  },
];
