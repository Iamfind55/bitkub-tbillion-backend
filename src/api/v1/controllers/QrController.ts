import { Request, Response, NextFunction } from "express";
import { QrService } from "../services/QrService";
import { BaseError } from "../helpers/ErrorHandler";
import { HttpCode } from "../helpers/HttpCode";
import { HttpMessage } from "../helpers/HttpMessage";
import { fileUploadMiddleware } from "../middleware/fileUpload";
import { QrCodes } from "../entities/QrCodes";
import { AppDataSource } from "../../../config/DataSource";
const service = new QrService();
import { unlink } from "fs";

export class QrController {
  private qrRepository = AppDataSource.getRepository(QrCodes);
  async all(req: Request, res: Response) {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const page = parseInt(req.query.page) || 1;
      const sortBy = req.query.sortBy || "createdAt";
      const order = req.query.order || "ASC";
      const startDate = req.query.startDate || "";
      const endDate = req.query.endDate || "";

      const results = await service.all(
        pageSize,
        page,
        sortBy,
        order,
        startDate,
        endDate
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

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;

      // Get original path
      const updateData = await this.qrRepository
        .createQueryBuilder("QrCodes")
        .where("qrId = :id", { id })
        .getOne();
      const imagePath = updateData.path;

      // Delete original

      await fileUploadMiddleware(req, res, async () => {
        const images = req.files;
        if (images?.length > 0) {
          unlink(imagePath, async (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log("success");
            }
          });
        }

        const wasUpdated = await service.update(id,images, req.body);
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

  async remove(req: Request, res: Response) {
    try {
      const id = req.params.id;
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
