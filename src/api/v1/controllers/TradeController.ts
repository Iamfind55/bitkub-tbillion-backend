import { Request, Response, NextFunction } from "express";
import { TradeService } from "../services/TradeService";
import { BaseError } from "../helpers/ErrorHandler";
import { HttpCode } from "../helpers/HttpCode";
import { HttpMessage } from "../helpers/HttpMessage";
import { AppDataSource } from "../../../config/DataSource";
import { Wallets } from "../entities/Wallets";
import { Durations } from "../entities/Durations";
import { Users } from "../entities/Users";
import { Trades } from "../entities/Trades";
import { NotFoundError } from "../helpers/ErrorHandler";
import { io } from "../../../app";
import { WalletTypes } from "../entities/WalletTypes";

const service = new TradeService();

export class TradeController {
    private tradeRepository = AppDataSource.getRepository(Trades);
    private walletRepository = AppDataSource.getRepository(Wallets);
    private walletTypeRepository = AppDataSource.getRepository(WalletTypes);
    private durationRepository = AppDataSource.getRepository(Durations);
    private userRepository = AppDataSource.getRepository(Users);
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
            const statusNotIn = req.query.statusNotIn || '';
            const userStatus = req.user.status;

            // Checking role
            if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account is not verified" });


            const results = await service.all(pageSize, page, sortBy, order, startDate, endDate, typeFilter, statusFilter, search, typeNotIn, statusNotIn);
            if (!results) return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: results.all, total: results.total });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async trading(req: Request, res: Response) {
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
            const statusNotIn = req.query.statusNotIn || '';

            const userId = req.user.userId;

            // Get user info
            const user = await this.userRepository.findOneBy({ userId });
            const userStatus = user.status;


            // Checking role
            // if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account is not verified" });


            const results = await service.trading(pageSize, page, sortBy, order, startDate, endDate, typeFilter, statusFilter, search, typeNotIn, statusNotIn);
            if (!results) return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
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


            // Get user info
            const user = await this.userRepository.findOneBy({ userId });
            const userStatus = user.status;

            // Checking role
            // if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account is not verified" });


            const result = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where({ user: userId })
                .getOne();
            const walletId = result?.walletId;


            const results = await service.owner(userId, walletId, pageSize, page, sortBy, order);
            if (!results) return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: results.all, total: results.total });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }
    async getTradesByOwnerId(req: Request, res: Response) {
        try {
            const userId = req.user.userId;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const page = parseInt(req.query.page) || 1;
            const sortBy = req.query.sortBy || 'transactionId';
            const order = req.query.order || 'ASC';

            // Get user info
            const user = await this.userRepository.findOneBy({ userId });
            const userStatus = user.status;

            // Checking role
            // if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account is not verified" });



            const result = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where({ user: userId })
                .getOne();
            const walletId = result?.walletId;


            const results = await service.getTradesByOwnerId(userId, walletId, pageSize, page, sortBy, order);
            if (!results) return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: results.all, total: results.total });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async getLastTradeByOwnerId(req: Request, res: Response) {
        try {
            const currentDate = new Date();
            const userId = req.user.userId;


            // Get user info
            const user = await this.userRepository.findOneBy({ userId });
            const userStatus = user.status;

            // Checking role
            // if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account is not verified" });


            const wallet = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where({ user: userId })
                .getOne();
            const walletId = wallet?.walletId;


            const results = await service.getLastTradeByOwnerId(userId, walletId);
            if (!results) return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, currentDate, data: results.one });
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
            const currentDate = new Date();
            const id = req.params.id;
            const userId = req.user.userId;

            // Get user info
            const user = await this.userRepository.findOneBy({ userId });
            const userStatus = user.status;

            // Checking role
            // if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account is not verified" });


            const result = await service.one(id);

            if (!result.length) return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, currentDate, data: result[0] });
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

            // Get user info
            const user = await this.userRepository.findOneBy({ userId });
            const userStatus = user.status;

            // Checking role
            if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account is not verified" });

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
            const walletId = result?.walletId;


            // Checking is trading or not
            // const trading = await this.tradeRepository
            //     .createQueryBuilder("Trades")
            //     .where("walletId = :walletId", { walletId })
            //     .orderBy("createdAt", "DESC")
            //     .getOne();
            // const isTrade = trading?.isTrade;
            // const type = trading?.type;
            // const walletTrading = trading?.wallet.walletId;
            // console.log(walletTrading);

            // if (type === req.body.type && walletTrading === walletId && isTrade === true) return res.json({ status: HttpCode.BAD_REQUEST, message: "Is trading" });

            //durations
            const duration = await this.durationRepository
                .createQueryBuilder('Durations')
                .where({ durationId: req.body.duration })
                .getOne();
            const minPrice = duration.minPrice;

            var wasCreated = {};
            if (req.body.quantity >= minPrice) {
                wasCreated = await service.add(walletId, userId, req.body);
            } else {
                return res.status(HttpCode.BAD_REQUEST).send({ status: HttpCode.BAD_REQUEST, message: "Minimum is: " + minPrice });
            }

            if (!wasCreated) return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });

            io.emit('trade', wasCreated);

            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: wasCreated })
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async pending(req: Request, res: Response) {
        try {
            const userId = req.user.userId;

            // Get user info
            const user = await this.userRepository.findOneBy({ userId });
            const userStatus = user.status;

            // Checking role
            // if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account is not verified" });


            const result = await this.walletRepository
                .createQueryBuilder('Wallets')
                .where({ user: userId })
                .getOne();
            const walletId = result?.walletId;

            //durations
            const duration = await this.durationRepository
                .createQueryBuilder('Durations')
                .where({ durationId: req.body.duration })
                .getOne();
            const minPrice = duration.minPrice;

            var wasCreated = {};
            if (req.body.quantity >= minPrice) {
                wasCreated = await service.pending(walletId, userId, req.body);
            } else {
                return res.status(HttpCode.BAD_REQUEST).send({ status: HttpCode.BAD_REQUEST, message: "Minimum is: " + minPrice });
            }

            if (!wasCreated) {
                return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }

            io.emit('trade', wasCreated);

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

            // Get user info
            const user = await this.userRepository.findOneBy({ userId });
            const userStatus = user.status;

            // Checking role
            // if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account is not verified" });


            const result = await this.tradeRepository
                .createQueryBuilder('trade')
                .leftJoinAndSelect('trade.wallet', 'wallet')
                .where({ tradeId: id })
                .getOne();

            const walletId = result?.wallet.walletId;


            const wasApproved = await service.approve(id, walletId, req.body);
            if (!wasApproved) {
                return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: wasApproved });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async transfer(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const userId = req.user.userId;

            // Get user info
            const user = await this.userRepository.findOneBy({ userId });
            const userStatus = user.status;

            // Checking role
            // if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account is not verified" });


            const result = await this.tradeRepository
                .createQueryBuilder('trade')
                .leftJoinAndSelect('trade.wallet', 'wallet')
                .where({ tradeId: id })
                .getOne();

            const walletId = result?.wallet.walletId;


            const wasTransfer = await service.transfer(id, walletId, req.body);
            if (!wasTransfer) {
                return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
            }
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: wasTransfer });
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

            // Get user info
            const user = await this.userRepository.findOneBy({ userId });
            const userStatus = user.status;

            // Checking role
            // if (userStatus !== "active") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Your account is not verified" });


            const wasUpdated = await service.update(id, req.body);
            if (!wasUpdated) throw new NotFoundError;
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
                return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
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
