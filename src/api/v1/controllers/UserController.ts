import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import {
  BaseError,
  UnauthorizedError,
  ValidationError,
} from "../helpers/ErrorHandler";
import { HttpMessage } from "../helpers/HttpMessage";
import { HttpCode } from "../helpers/HttpCode";
import { isEmailValid } from "../validations/validateEmail";
import { AppDataSource } from "../../../config/DataSource";
import { Users } from "../entities/Users";
import bcrypt from "bcrypt";
import { fileUploadMiddleware } from "../middleware/fileUpload";
import { unlink } from "fs";

const service = new UserService();

export class UserController {
  private userRepository = AppDataSource.getRepository(Users);
  async all(req: Request, res: Response) {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const page = parseInt(req.query.page) || 1;
      const sortBy = req.query.sortBy || "createdAt";
      const order = req.query.order || "ASC";
      const startDate = req.query.startDate || "";
      const endDate = req.query.endDate || "";
      const roleFilter = req.query.roleFilter || undefined;
      const statusFilter = req.query.statusFilter || undefined;
      const search = req.query.search || "";

      const results = await service.all(
        pageSize,
        page,
        sortBy,
        order,
        startDate,
        endDate,
        roleFilter,
        statusFilter,
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

  async owner(req: Request, res: Response) {
    try {
      const id = req.user.userId;

      const result = await service.owner(id);

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

  async wallet(req: Request, res: Response) {
    try {
      const id = req.user.userId;
      const result = await service.wallet(id);

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
      const body = req.body;
      const userId = req.user.userId;
      const role = req.user.role;

      // Checking permission
      if (role !== "admin")
        return res
          .status(HttpCode.NOT_FOUND)
          .send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });

      if (!isEmailValid(req.body.email))
        throw new ValidationError(req.body.email);

      const wasCreated = await service.add(body);
      if (!wasCreated) {
        res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
      }

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
      const role = req.user.role;

      // if (role !== "operator" || role !== "admin") return res.status(HttpCode.NOT_FOUND).send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });

      const wasUpdated = await service.update(id, req.body);
      if (!wasUpdated) {
        res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
      }
      res.status(HttpCode.SUCCESSFUL).json({
        status: HttpCode.SUCCESSFUL,
        message: HttpMessage.SUCCESSFUL,
        data: wasUpdated,
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
      const role = req.user.role;

      if (role !== "operator")
        return res
          .status(HttpCode.NOT_FOUND)
          .send({ status: HttpCode.BAD_REQUEST, message: "Permission denied" });

      const wasUpdated = await service.approve(id, req.body);
      if (!wasUpdated) {
        res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
      }
      res.status(HttpCode.SUCCESSFUL).json({
        status: HttpCode.SUCCESSFUL,
        message: HttpMessage.SUCCESSFUL,
        data: wasUpdated,
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

  async changePassword(req: Request, res: Response) {
    try {
      const id = req.user.userId;
      const role = req.user.role;
      const { oldPassword, newPassword, confirmPassword } = req.body;

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);
      const hashedConfirmPassword = await bcrypt.hash(confirmPassword, salt);

      // Get user data
      const user = await this.userRepository
        .createQueryBuilder("Users")
        .where("userId = :id", { id })
        .getOne();

      const userRole = user?.role;
      const myOldPassword = user.password;
      const currentPassword = await bcrypt.compare(oldPassword, myOldPassword);

      // Checking role
      if (role !== userRole)
        return res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: "Permission denied" });

      // Validate current password
      if (!currentPassword)
        return res.status(HttpCode.NOT_FOUND).json({
          status: HttpCode.NOT_FOUND,
          message: "Old password is incorrect",
        });

      // Validate new password
      if (hashedNewPassword !== hashedConfirmPassword)
        return res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: "Password not match" });

      const wasUpdated = await service.changePassword(id, hashedNewPassword);
      if (!wasUpdated) {
        res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
      }
      res.status(HttpCode.SUCCESSFUL).json({
        status: HttpCode.SUCCESSFUL,
        message: HttpMessage.SUCCESSFUL,
        data: wasUpdated,
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

  async profile(req: Request, res: Response) {
    try {
      const id = req.params.id;

      // Get original path
      const userData = await this.userRepository
        .createQueryBuilder("Users")
        .where("userId = :userId", { userId: id })
        .getOne();
      const imagePath = userData.path;

      // Delete original
      if (imagePath) {
        await unlink(imagePath, async (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log("success");
          }
        });
      }

      await fileUploadMiddleware(req, res, async () => {
        const images = req.files;

        const wasCreated = await service.profile(id, images);
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

  async remove(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const role = req.user.role;

      // Checking role
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

  // customer change user
  async changeCustomerPassword(req: Request, res: Response) {
    try {
      const role = req.user.role;
      const { userId, oldPassword, newPassword, confirmPassword } = req.body;

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);
      const hashedConfirmPassword = await bcrypt.hash(confirmPassword, salt);

      // Get user data
      const user = await this.userRepository
        .createQueryBuilder("Users")
        .where("userId = :userId", { userId })
        .getOne();
      const myOldPassword = user.password;
      const currentPassword = await bcrypt.compare(oldPassword, myOldPassword);

      // Checking role
      if (role !== "admin" && role !== "operator")
        return res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: "Permission denied" });

      // Validate current password
      if (!currentPassword)
        return res.status(HttpCode.NOT_FOUND).json({
          status: HttpCode.NOT_FOUND,
          message: "Old password is incorrect",
        });

      // Validate new password
      if (hashedNewPassword !== hashedConfirmPassword)
        return res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: "Password not match" });

      const wasUpdated = await service.changeCustomerPassword(
        userId,
        hashedNewPassword
      );
      if (!wasUpdated) {
        res
          .status(HttpCode.NOT_FOUND)
          .json({ status: HttpCode.NOT_FOUND, message: HttpMessage.NOT_FOUND });
      }
      res.status(HttpCode.SUCCESSFUL).json({
        status: HttpCode.SUCCESSFUL,
        message: HttpMessage.SUCCESSFUL,
        data: wasUpdated,
      });
    } catch (error) {
      console.log(error);

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
