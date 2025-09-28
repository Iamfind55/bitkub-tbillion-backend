import { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/TransactionService";
import { BadRequestError, BaseError, NotFoundError, PermissionDeniedError } from "../helpers/ErrorHandler";
import { HttpCode } from "../helpers/HttpCode";
import { HttpMessage } from "../helpers/HttpMessage";
import { AppDataSource } from "../../../config/DataSource";
import { Wallets } from "../entities/Wallets";
import { Transactions } from "../entities/Transactions";
import { Users } from "../entities/Users";
import { io } from "../../../app";
const service = new TransactionService();

export class TransactionController {
    private userRepository = AppDataSource.getRepository(Users);
    private walletRepository = AppDataSource.getRepository(Wallets);
    private transactionRepository = AppDataSource.getRepository(Transactions);
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

            const results = await service.withdrawPending(pageSize, page, sortBy, order, startDate, endDate);
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

    async owner(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const page = parseInt(req.query.page) || 1;
            const sortBy = req.query.sortBy || 'transactionId';
            const order = req.query.order || 'ASC';

            const result = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where({ user: userId })
                .getOne();
            const walletId = result?.walletId;


            const results = await service.owner(userId, walletId, pageSize, page, sortBy, order);
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

            const result = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where({ user: userId })
                .getOne();
            const walletId = result?.walletId;


            const results = await service.getWithdrawByOwnerId(userId, walletId, pageSize, page, sortBy, order);
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

    async deposit(req: Request, res: Response) {
        try {
            const userId = req.body.userId;
            const amount = req.body.amount;
            const role = req.user.role;

            // Validate user
            const userExisting = await this.userRepository
                .createQueryBuilder("Users")
                .where({ userId })
                .getOne();
            if (!userExisting) return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.NOT_FOUND, message: "Resource not found" });

            // Get wallet with user id
            const result = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where({ user: userId })
                .getOne();
            if (!result) return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.NOT_FOUND, message: "Resource not found" });
            const walletId = result?.walletId;

            // Check permission
            if (role !== "operator") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });
            if (amount < 100) return res.status(HttpCode.BAD_REQUEST).send({ status: HttpCode.BAD_REQUEST, message: "Minimum deposit amount $100" });

            const wasCreated = await service.deposit(walletId, req.body);
            if (!wasCreated) return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });

            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: wasCreated })
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async withdraw(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const role = req.user.role;

            const result = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where({ user: userId })
                .getOne();

            if (!result) return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.NOT_FOUND, message: "Not found" + userId });
            const walletId = result?.walletId;
            const balance = result?.balance;


            if (role !== "customer") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });
            if (balance < 0) return res.status(HttpCode.BAD_REQUEST).send({ status: HttpCode.BAD_REQUEST, message: "Can not withdraw" });
            const wasCreated = await service.withdraw(walletId, req.body);
            if (!wasCreated) {
                res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }

            io.emit('withdraw', wasCreated);

            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: wasCreated })
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }


    async exchange(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const role = req.user.role;


            const result = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where({ user: userId })
                .getOne();

            if (!result) return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.NOT_FOUND, message: "Not found" + userId });
            const walletId = result?.walletId;

            if (role !== "operator") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });
            // if (req.body.amount < 100) return res.status(HttpCode.BAD_REQUEST).send({ status: HttpCode.BAD_REQUEST, message: "Can not deposit" });

            const wasCreated = await service.exchange(walletId, req.body);
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

    async add(req: Request, res: Response) {
        try {
            const wasCreated = await service.add(req.body);
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

    async approve(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const userId = req.user.userId;
            const role = req.user.role;
            const status = req.body.status;

            const result = await this.transactionRepository
                .createQueryBuilder('transaction')
                .leftJoinAndSelect('transaction.wallet', 'wallet')
                .where({ transactionId: id })
                .getOne();
            const walletId = result?.wallet.walletId;
            const transactionStatus = result?.status;


            //User permission
            if (role !== "operator") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });

            if (transactionStatus !== "pending") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.NOT_FOUND, message: "Already approved" });

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

    async update(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const userId = req.user.userId;
            const role = req.user.role;

            const result = await this.transactionRepository
                .createQueryBuilder('transaction')
                .leftJoinAndSelect('transaction.wallet', 'wallet')
                .where({ transactionId: id })
                .getOne();
            const walletId = result?.wallet.walletId;

            //User permission
            if (role !== "operator") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });

            const wasUpdated = await service.update(id, walletId, req.body);
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
