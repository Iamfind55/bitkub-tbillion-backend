import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/WalletService";
import { BaseError } from "../helpers/ErrorHandler";
import { HttpMessage } from "../helpers/HttpMessage";
import { HttpCode } from "../helpers/HttpCode";
import { WalletTypes } from "../entities/WalletTypes";
import { AppDataSource } from "../../../config/DataSource";
import { Wallets } from "../entities/Wallets";

const service = new UserService();

export class WalletController {
    private walletRepository = AppDataSource.getRepository(Wallets);
    private walletTypeRepository = AppDataSource.getRepository(WalletTypes);
    async all(req: Request, res: Response) {
        try {
            const pageSize = parseInt(req.query.pageSize) || 10;
            const page = parseInt(req.query.page) || 1;
            const sortBy = req.query.sortBy || 'userId';
            const order = req.query.order || 'ASC';
            const search = req.query.search || null;


            const role = req.user.role;
            // if (role !== "operator") return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: "You don't have permission" });
            const results = await service.all(pageSize, page, sortBy, order, search);
            if (!results) {
                res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: results.all, total: results.total });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async one(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const role = req.user.role;
            // if (role !== "operator") return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: "You don't have permission" });
            const result = await service.one(id);
            if (!result.length) {
                res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: result[0] });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async wallet(req: Request, res: Response) {
        try {
            const id = req.user.userId;

            // Get wallet type
            const walletType = await this.walletTypeRepository
                .createQueryBuilder('WalletTypes')
                .where({ code: "usd" })
                .getOne();
            const walletTypeId = walletType.walletTypeId;

            // Get wallet with user id
            const wallet = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where('Wallets.type = :walletTypeId', { walletTypeId })
                .andWhere('Wallets.user = :id', { id })
                .getOne();

            const walletId = wallet?.walletId;


            const result = await service.wallet(walletId);


            if (!result) {
                res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: result[0] });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async owner(req: Request, res: Response) {
        try {
            const id = req.user.userId;

            const result = await service.owner(id);

            if (!result) {
                res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: result });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async add(req: Request, res: Response) {
        try {
            const createdBy = req.user.userId;
            const role = req.user.role;
            if (role !== "operator") return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: "You don't have permission" });
            const wasCreated = await service.add(createdBy, req.body);
            if (!wasCreated) {
                res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }

            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: wasCreated })
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const role = req.user.role;

            if (role !== "operator") return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: "You don't have permission" });
            const wasUpdated = await service.update(id, req.body);
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
            if (role !== "admin") return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: "You don't have permission" });
            const wasDeleted = await service.remove(id);
            if (!wasDeleted) {
                res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }
}
