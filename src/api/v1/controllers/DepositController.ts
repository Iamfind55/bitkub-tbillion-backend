import { Request, Response, NextFunction } from "express";
import { DepositService } from "../services/DepositService";
import {
  BadRequestError,
  BaseError,
  NotFoundError,
  PermissionDeniedError,
} from "../helpers/ErrorHandler";
import { HttpCode } from "../helpers/HttpCode";
import { HttpMessage } from "../helpers/HttpMessage";
import { AppDataSource } from "../../../config/DataSource";
import { Wallets } from "../entities/Wallets";
import { Users } from "../entities/Users";
import { io } from "../../../app";
import { WalletTypes } from "../entities/WalletTypes";
const service = new DepositService();

export class DepositController {
  private userRepository = AppDataSource.getRepository(Users);
  private walletRepository = AppDataSource.getRepository(Wallets);
  private walletTypeRepository = AppDataSource.getRepository(WalletTypes);
  async all(req: Request, res: Response) {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const page = parseInt(req.query.page) || 1;
      const sortBy = req.query.sortBy || "createdAt";
      const order = req.query.order || "ASC";
      const startDate = req.query.startDate || "";
      const endDate = req.query.endDate || "";
      const typeFilter = req.query.typeFilter || undefined;
      const statusFilter = req.query.statusFilter || undefined;
      const search = req.query.search || "";
      const typeNotIn = req.query.typeNotIn || "";
      const statusIn = req.query.statusIn || "";
      const statusNotIn = req.query.statusNotIn || "";

      const includedTypes = req.query.includedTypes || "";
      const excludedTypes = req.query.excludedTypes || "";
      const includedStatuses = req.query.includedStatuses || "";
      const excludedStatuses = req.query.excludedStatuses || "";

      const results = await service.all(
        pageSize,
        page,
        sortBy,
        order,
        startDate,
        endDate,
        typeFilter,
        statusFilter,
        search,
        includedTypes,
        includedStatuses,
        excludedTypes,
        excludedStatuses
      );
      if (!results) {
        res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
      }
      res.status(HttpCode.SUCCESSFUL).json({
        status: HttpCode.SUCCESSFUL,
        message: HttpMessage.SUCCESSFUL,
        data: results.all,
        total: results.total,
      });
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
          status: HttpCode.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    }
  }

  async getDepositByOwnerId(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const page = parseInt(req.query.page) || 1;
      const sortBy = req.query.sortBy || "transactionId";
      const order = req.query.order || "ASC";
      const startDate = req.query.startDate || "";
      const endDate = req.query.endDate || "";
      const search = req.query.search || "";

      const result = await this.walletRepository
        .createQueryBuilder("Wallets")
        .where({ user: userId })
        .getOne();
      const walletId = result?.walletId;

      const results = await service.getDepositByOwnerId(
        userId,
        walletId,
        pageSize,
        page,
        sortBy,
        order,
        startDate,
        endDate,
        search
      );
      if (!results) {
        res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
      }
      res.status(HttpCode.SUCCESSFUL).json({
        status: HttpCode.SUCCESSFUL,
        message: HttpMessage.SUCCESSFUL,
        data: results.all,
        total: results.total,
      });
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
          status: HttpCode.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    }
  }

  async one(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await service.one(id);

      if (!result) {
        res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
      }
      res.status(HttpCode.SUCCESSFUL).json({
        status: HttpCode.SUCCESSFUL,
        message: HttpMessage.SUCCESSFUL,
        data: result[0],
      });
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
          status: HttpCode.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    }
  }

    async add(req: Request, res: Response) {
        try {
            const userId = req.body.userId;
            const amount = req.body.amount;
            const user = req.body.userId;
            const role = req.user.role;

      // Validate user
      const userExisting = await this.userRepository
        .createQueryBuilder("Users")
        .where({ userId })
        .getOne();
      if (!userExisting)
        return res
          .status(HttpCode.NOT_FOUND)
          .send({ status: HttpCode.NOT_FOUND, message: "Resource not found" });

      // Get wallet type
      const walletType = await this.walletTypeRepository
        .createQueryBuilder("WalletTypes")
        .where({ code: "usd" })
        .getOne();
      const walletTypeId = walletType.walletTypeId;

            // Get wallet with user id
            const result = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where('Wallets.type = :walletTypeId', { walletTypeId })
                .andWhere('Wallets.user = :user', { user })
                .getOne();
            if (!result) return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.NOT_FOUND, message: "Resource not found" });
            const walletId = result?.walletId;

      // Check permission
      if (role === "customer")
        return res
          .status(HttpCode.NOT_FOUND)
          .send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });
      if (amount < 100)
        return res.status(HttpCode.BAD_REQUEST).send({
          status: HttpCode.BAD_REQUEST,
          message: "Minimum deposit amount $100",
        });

      const wasCreated = await service.add(walletId, userId, req.body);
      if (!wasCreated)
        return res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });

      // Socket response to client
      io.emit("deposit", wasCreated);

      res.status(HttpCode.SUCCESSFUL).json({
        status: HttpCode.SUCCESSFUL,
        message: HttpMessage.SUCCESSFUL,
        data: wasCreated,
      });
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
          status: HttpCode.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const role = req.user.role;

      // Checking role
      if (role === "customer")
        return res
          .status(HttpCode.NOT_FOUND)
          .send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });

      const wasDeleted = await service.remove(id);
      if (!wasDeleted) {
        res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
      }
      res
        .status(HttpCode.SUCCESSFUL)
        .json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL });
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
          status: HttpCode.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    }
  }
  async updateDiposit(req: Request, res: Response) {
    try {
      const walletId = req.body.walletId;
      const balance = req.body.amount;

      const wasUpdated = await this.walletRepository
        .createQueryBuilder()
        .update(Wallets)
        .set({ balance })
        .where({ walletId: walletId }) // Assuming walletId is the primary key field
        .execute();
      if (wasUpdated) {
        res.status(HttpCode.SUCCESSFUL).json({
          status: HttpCode.SUCCESSFUL,
          message: HttpMessage.SUCCESSFUL,
          data: { walletId: walletId, balance: balance },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
