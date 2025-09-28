import { Request, Response, NextFunction } from "express";
import { ProfileService } from "../services/ProfileService";
import { BaseError } from "../helpers/ErrorHandler";
import { HttpCode } from "../helpers/HttpCode";
import { HttpMessage } from "../helpers/HttpMessage";
import { Profiles } from "../entities/Profiles";
import { fileUploadMiddleware } from "../middleware/fileUpload";
import { AppDataSource } from "../../../config/DataSource";
import { unlink } from 'fs';
import { Users } from "../entities/Users";


const service = new ProfileService();

export class ProfileController {
    private profileRepository = AppDataSource.getRepository(Profiles);
    private userRepository = AppDataSource.getRepository(Users);

    async all(req: Request, res: Response) {
        try {
            const pageSize = parseInt(req.query.pageSize) || 10;
            const page = parseInt(req.query.page) || 1;
            const sortBy = req.query.sortBy || 'createdAt';
            const order = req.query.order || 'ASC';

            const results = await service.all(pageSize, page, sortBy, order);
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

            // Handle processing request
            await fileUploadMiddleware(req, res, async () => {
                const images = req.files;
                const wasCreated = await service.add(userId, images);
                if (!wasCreated) {
                    res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
                }
                res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: wasCreated })
            });
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

            // Get original path
            const profileData = await this.profileRepository
                .createQueryBuilder("Profiles")
                .where("profileId = :profileId", { profileId: id })
                .getOne();
            const imagePath = profileData.path;

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

                const wasCreated = await service.update(id, images);
                if (!wasCreated) {
                    res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
                }
                res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, data: wasCreated })
            });
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

            // Get original path
            const profileData = await this.profileRepository
                .createQueryBuilder("Profiles")
                .where("profileId = :profileId", { profileId: id })
                .getOne();
            const imagePath = profileData.path;

            // Delete original
            await unlink(imagePath, async (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log("success");

                }
            });

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
