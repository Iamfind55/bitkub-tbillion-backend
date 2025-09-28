import { Request, Response, NextFunction } from "express";
import { BankService } from "../services/BankService";
import { BaseError } from "../helpers/ErrorHandler";
import { HttpCode } from "../helpers/HttpCode";
import { HttpMessage } from "../helpers/HttpMessage";
import { AppDataSource } from "../../../config/DataSource";
import { Banks } from "../entities/Banks";
import { Users } from "../entities/Users";
const service = new BankService();

export class BankController {
    private db = AppDataSource.getRepository(Banks);
    private userRepository = AppDataSource.getRepository(Users);
    async all(req: Request, res: Response) {
        try {
            const pageSize = parseInt(req.query.pageSize) || 10;
            const page = parseInt(req.query.page) || 1;
            const sortBy = req.query.sortBy || 'createdAt';
            const order = req.query.order || 'ASC';
            const startDate = req.query.startDate || '';
            const endDate = req.query.endDate || '';
            const search = req.query.search || undefined;

            const results = await service.all(pageSize, page, sortBy, order, startDate, endDate, search);
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

    async one(req: Request, res: Response) {
        try {
            const id = req.params.id;
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

    async add(req: Request, res: Response) {
        try {
            const userId = req.user.userId;

            const existingAccountNumber = await this.db.findBy({ name: req.body.name, accountNumber: req.body.accountNumber });
            if (existingAccountNumber.length != 0) return res.status(HttpCode.BAD_REQUEST).send({ status: HttpCode.BAD_REQUEST, message: "This account is already" });

            const wasCreated = await service.add(userId, req.body);
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
