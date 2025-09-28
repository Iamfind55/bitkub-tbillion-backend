import { Request, Response, NextFunction } from "express";
import { WithdrawService } from "../services/WithdrawService";
import { BadRequestError, BaseError, NotFoundError, PermissionDeniedError } from "../helpers/ErrorHandler";
import { HttpCode } from "../helpers/HttpCode";
import { HttpMessage } from "../helpers/HttpMessage";
import { AppDataSource } from "../../../config/DataSource";
import { Wallets } from "../entities/Wallets";
import { Transactions } from "../entities/Transactions";
import { Users } from "../entities/Users";
import { io } from "../../../app";
import { Withdraws } from "../entities/Withdraws";
import { WalletTypes } from "../entities/WalletTypes";
const service = new WithdrawService();

export class WithdrawController {
    private userRepository = AppDataSource.getRepository(Users);
    private walletRepository = AppDataSource.getRepository(Wallets);
    private transactionRepository = AppDataSource.getRepository(Transactions);
    private withdrawRepository = AppDataSource.getRepository(Withdraws);
    private walletTypeRepository = AppDataSource.getRepository(WalletTypes);
    async all(req: Request, res: Response) {
        try {
            const pageSize = parseInt(req.query.pageSize) || 10;
            const page = parseInt(req.query.page) || 1;
            const sortBy = req.query.sortBy || 'createdAt';
            const order = req.query.order || 'ASC';
            const startDate = req.query.startDate || '';
            const endDate = req.query.endDate || '';
            const typeFilter = req.query.typeFilter || undefined;
            const statusFilter = req.query.statusFilter || undefined;
            const search = req.query.search || '';
            const typeNotIn = req.query.typeNotIn || '';
            const statusIn = req.query.statusIn || '';
            const statusNotIn = req.query.statusNotIn || '';


            const includedTypes = req.query.includedTypes || '';
            const excludedTypes = req.query.excludedTypes || '';
            const includedStatuses = req.query.includedStatuses || '';
            const excludedStatuses = req.query.excludedStatuses || '';

            const results = await service.all(pageSize, page, sortBy, order, startDate, endDate, typeFilter, statusFilter, search, includedTypes, includedStatuses, excludedTypes, excludedStatuses);
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

    async withdrawPending(req: Request, res: Response) {
        try {
            const pageSize = parseInt(req.query.pageSize) || 10;
            const page = parseInt(req.query.page) || 1;
            const sortBy = req.query.sortBy || 'createdAt';
            const order = req.query.order || 'ASC';
            const startDate = req.query.startDate || '';
            const endDate = req.query.endDate || '';
            const statusFilter = req.query.status || undefined;
            const search = req.query.search || '';

            const results = await service.withdrawPending(pageSize, page, sortBy, order, startDate, endDate, search);
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

    async getWithdrawByOwnerId(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const page = parseInt(req.query.page) || 1;
            const sortBy = req.query.sortBy || 'transactionId';
            const order = req.query.order || 'ASC';
            const startDate = req.query.startDate || '';
            const endDate = req.query.endDate || '';
            const search = req.query.search || '';

            const result = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where({ user: userId })
                .getOne();
            const walletId = result?.walletId;


            const results = await service.getWithdrawByOwnerId(userId, walletId, pageSize, page, sortBy, order, startDate, endDate, search);
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
            const result = await service.one(id);

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


    async add(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const role = req.user.role;
            const userStatus = req.user.status;
            const amount = req.body.amount;

            // Checking role
            if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account was't verified" });

            // Get wallet type
            const walletType = await this.walletTypeRepository
                .createQueryBuilder('WalletTypes')
                .where({ code: "usd" })
                .getOne();
            const walletTypeId = walletType.walletTypeId;

            // Get wallet with user id
            const result = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where('Wallets.type = :walletTypeId', { walletTypeId })
                .andWhere('Wallets.user = :userId', { userId })
                .getOne();

            if (!result) return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.NOT_FOUND, message: "Not found" + userId });
            const walletId = result?.walletId;
            const balance = result?.balance;
            const minimumWithdrawal = 40;


            if (balance < Number(amount)) return res.status(HttpCode.BAD_REQUEST).send({ status: HttpCode.BAD_REQUEST, message: "Can't withdraw. Your balance is: " + balance });
            if ((balance - Number(amount)) <= minimumWithdrawal) return res.status(HttpCode.BAD_REQUEST).send({ status: HttpCode.BAD_REQUEST, message: "Can't withdraw less than $40. Your balance is: " + balance });

            const wasCreated = await service.add(walletId, userId, req.body);
            if (!wasCreated) {
                res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }

            // Socket response to client
            io.emit('withdraw', wasCreated);

            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: wasCreated });
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
            const userId = req.user.userId;
            const role = req.user.role;
            const userStatus = req.user.status;
            const status = req.body.status;

            // Checking role
            // if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account was't verified" });


            const result = await this.withdrawRepository
                .createQueryBuilder('withdraw')
                .leftJoinAndSelect('withdraw.wallet', 'wallet')
                .where({ withdrawId: id })
                .getOne();
            const walletId = result?.wallet.walletId;
            const withdrawStatus = result?.status;


            // Permission can approved or rejected
            if (role === "customer") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });

            // Withdraw is not completed or rejected
            if (withdrawStatus !== "pending") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.NOT_FOUND, message: "Already approved or rejected" });

            const wasUpdated = await service.update(id, walletId, req.body);
            if (!wasUpdated) {
                res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }

            io.emit('confirm_withdraw', wasUpdated);

            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: wasUpdated });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async edit(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const role = req.user.role;
            const userStatus = req.user.status;


            // Checking role
            if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account was't verified" });


            // Permission can approved or rejected
            if (role === "customer") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });

            const wasUpdated = await service.edit(id, req.body);
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
            if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account was't verified" });


            // Checking permission
            if (role !== "admin") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });

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
