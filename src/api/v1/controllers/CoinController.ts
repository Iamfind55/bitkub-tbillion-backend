import { Request, Response, NextFunction } from "express";
import { CoinService } from "../services/CoinService";
import { BaseError } from "../helpers/ErrorHandler";
import { HttpCode } from "../helpers/HttpCode";
import { HttpMessage } from "../helpers/HttpMessage";
import { fileUploadMiddleware } from "../middleware/fileUpload";
import { Coins } from "../entities/Coins";
import { AppDataSource } from "../../../config/DataSource";
const service = new CoinService();
import { io } from "../../../app";
import { Wallets } from "../entities/Wallets";
import { unlink } from "fs";

export class CoinController {
  private coinRepository = AppDataSource.getRepository(Coins);
  private walletRepository = AppDataSource.getRepository(Wallets);

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

  async getCoinByOwnerId(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const page = parseInt(req.query.page) || 1;
      const sortBy = req.query.sortBy || "transactionId";
      const order = req.query.order || "ASC";
      const startDate = req.query.startDate || "";
      const endDate = req.query.endDate || "";
      const search = req.query.search || "";

      const results = await service.getCoinByOwnerId(
        userId,
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
      const userId = req.user.userId;

      await fileUploadMiddleware(req, res, async () => {
        const images = req.files;
        const wasCreated = await service.add(userId, images, req.body);
        if (!wasCreated) {
          res.status(HttpCode.NOT_FOUND).json({
            status: HttpCode.NOT_FOUND,
            message: HttpMessage.NOT_FOUND,
          });
        }
        res.status(HttpCode.SUCCESSFUL).json({
          status: HttpCode.SUCCESSFUL,
          message: HttpMessage.SUCCESSFUL,
          data: wasCreated,
        });
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

  async withdraw(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const userStatus = req.user.status;
      const amount = req.body.amount;
      const walletId = req.body.walletId;

      // Checking role
      if (userStatus !== "active")
        return res.status(HttpCode.NOT_FOUND).send({
          status: HttpCode.BAD_REQUEST,
          message: "Your account was't verified",
        });

      // Checking wallet id
      const walletExisting = await this.walletRepository.findOneBy({
        walletId,
      });
      if (!walletExisting)
        return res.status(HttpCode.BAD_REQUEST).json({
          status: HttpCode.BAD_REQUEST,
          message: "Couldn't find wallet",
        });

      // Get wallet info
      const result = await this.walletRepository
        .createQueryBuilder("Wallets")
        .where({ walletId: walletId })
        .getOne();

      const balance = result?.balance;

      if (balance < Number(amount))
        return res.status(HttpCode.BAD_REQUEST).send({
          status: HttpCode.BAD_REQUEST,
          message: "Can't withdraw. Your balance is: " + balance,
        });
      if (balance - Number(amount) <= 0)
        return res.status(HttpCode.BAD_REQUEST).send({
          status: HttpCode.BAD_REQUEST,
          message: "Can't withdraw less than $40. Your balance is: " + balance,
        });

      const wasCreated = await service.withdraw(userId, req.body);
      if (!wasCreated) {
        res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
      }

      // Socket response to client
      io.emit("withdraw_coin", wasCreated);

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

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;

      // Get original path
      const coinData = await this.coinRepository
        .createQueryBuilder("Coins")
        .where("coinId = :id", { id })
        .getOne();
      const imagePath = coinData.path;

      // Delete original
      await unlink(imagePath, async (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("success");
        }
      });

      await fileUploadMiddleware(req, res, async () => {
        const images = req.files;
        const wasUpdated = await service.update(id, images, req.body);
        if (!wasUpdated) {
          res.status(HttpCode.NOT_FOUND).json({
            status: HttpCode.NOT_FOUND,
            message: HttpMessage.NOT_FOUND,
          });
        }
        res.status(HttpCode.SUCCESSFUL).json({
          status: HttpCode.SUCCESSFUL,
          message: HttpMessage.SUCCESSFUL,
          data: wasUpdated,
        });
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

    async approve(req: Request, res: Response) {
        try {
            const id = req.params.id;

            const coin = await this.coinRepository
            .createQueryBuilder("coin")
            .leftJoinAndSelect('coin.wallet', 'wallet')
            .where('coinId = :id', { id })
            .getOne();
        const status = coin.status;

        if(status === 'completed') return res.json({status: HttpCode.BAD_REQUEST, message: "รายการนี้ได้รับการอนุมัติแล้ว"});

            const wasUpdated = await service.approve(id, req.body);
            if (!wasUpdated) {
                res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: wasUpdated });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async remove(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const role = req.user.role;
            const userStatus = req.user.status;

      // Checking role
      if (userStatus !== "active")
        return res.status(HttpCode.NOT_FOUND).send({
          status: HttpCode.BAD_REQUEST,
          message: "Your account was't verified",
        });

      // Checking permission
      if (role !== "admin")
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

  
}
