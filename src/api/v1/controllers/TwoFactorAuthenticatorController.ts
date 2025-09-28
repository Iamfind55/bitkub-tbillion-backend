import { Request, Response, NextFunction } from "express";
import { TwoFactorAuthenticatorService } from "../services/TwoFactorAuthenticatorService";
import { BaseError } from "../helpers/ErrorHandler";
import { HttpCode } from "../helpers/HttpCode";
import { HttpMessage } from "../helpers/HttpMessage";
const service = new TwoFactorAuthenticatorService();

export class TwoFactorAuthenticatorController {

    async enabled(req: Request, res: Response) {
        try {

            const wasCreated = await service.enabled(req.body);
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

    async verified(req: Request, res: Response) {
        try {
            const id = req.params.id;

            const wasUpdated = await service.verified(req.body);
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

    async disabled(req: Request, res: Response) {
        try {
            const id = req.params.id;

            const wasUpdated = await service.disabled(req.body);
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
}
