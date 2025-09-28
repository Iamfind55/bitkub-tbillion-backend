import { Request, Response, NextFunction } from "express";
import { AlreadyExistError, BadRequestError, BaseError, ExpiredError, ValidateError, ValidationError } from "../helpers/ErrorHandler";
import { AppDataSource } from "../../../config/DataSource";
import { Users } from "../entities/Users";
import { Wallets } from "../entities/Wallets";
import * as jwt from 'jsonwebtoken';
import { jwtTokens } from "../utils/jwtTokens";
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";
import { HttpCode } from "../helpers/HttpCode";

import { isEmailValid } from "../validations/validateEmail";
import { HttpMessage } from "../helpers/HttpMessage";
import { NotFoundError } from "../helpers/ErrorHandler";
import { sendEmail } from "../helpers/MailService";
import { UserProveAuth } from "../entities/enums";
import { WalletTypes } from "../entities/WalletTypes";

export class AuthController {
    private db = AppDataSource.getRepository(Users);
    private walletTypeRepository = AppDataSource.getRepository(WalletTypes);
    private queryBuilder = AppDataSource.createQueryBuilder();
    private createQueryBuilder = AppDataSource.createQueryBuilder();

    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
            const userId = uuidv4();
            const accountId = (Math.floor(Math.random() * 900000) + 100000).toString();

            const { name, phone, email, password, address } = req.body;

            if (name === "" || name === null || name === undefined) return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: "Name is required" });
            if (email) {
                if (!isEmailValid(email)) return res.status(HttpCode.NOT_FOUND).json({ status: HttpCode.NOT_FOUND, message: "Invalid email" });
            }

            // Create hash
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Verify password
            if (password.length < 8) return res.status(400).json({ status: 400, message: "Password must less than 8 characters", error: "Bad request" });

            // Check user account
            const defaultCurrency = "usd";
            // const existingUser = await this.db.findBy({ email });
            // const existingUser = await this.db
            //     .createQueryBuilder("Users")
            //     .orWhere('email = :email', { email })
            //     .orWhere('phone = :phone', { phone })
            //     .getOne();

            // const queryBuilder = this.db.createQueryBuilder("user");

            // if (email) {
            //     queryBuilder.where("user.email = :email", { email });
            //     const existingUser = await queryBuilder.getOne();
            //     // if (existingUser) return res.status(400).json({ status: HttpCode.NOT_FOUND, message: 'Email already registered' });
            // }

            // if (phone) {
            //     queryBuilder.orWhere("user.phone = :phone", { phone });
            //     const existingUser = await queryBuilder.getOne();
            //     // if (existingUser) return res.status(400).json({ status: HttpCode.NOT_FOUND, message: 'Email already registered' });
            // }

            

            // Check wallet type as 'usd'
            let walletTypeId = null;
            const walletTypeExisting = await this.walletTypeRepository
                .createQueryBuilder("WalletTypes")
                .where('code = :code', { code: defaultCurrency })
                .getOne();


            if (!walletTypeExisting) {
                const insertWalletType = await this.walletTypeRepository
                    .createQueryBuilder("WalletTypes")
                    .insert()
                    .into(WalletTypes)
                    .values({ name: "usd", symbol: "$", code: defaultCurrency, rate: 1, createdAt })
                    .execute();
                walletTypeId = insertWalletType.identifiers[0].walletTypeId;
            } else {
                const walletType = await this.walletTypeRepository
                    .createQueryBuilder("WalletTypes")
                    .where('code = :defaultCurrency', { defaultCurrency })
                    .getOne();
                walletTypeId = walletType.walletTypeId;
            }


            // Create new user account
            await this.db
                .createQueryBuilder("Users")
                .insert()
                .into(Users)
                .values({ userId: userId, accountId, name, phone, email, password: hashedPassword, address, createdAt })
                .execute();

            // Create new wallet account
            await this.walletTypeRepository
                .createQueryBuilder("Wallets")
                .insert()
                .into(Wallets)
                .values({ type: walletTypeId, user: userId, balance: 0, createdAt })
                .execute();


            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const phone = email;
            // const user = await this.db.findOne({ where: { email } });
            // const user = await this.db
            //     .createQueryBuilder("Users")
            //     .where('email = :email', { email })
            //     .orWhere('phone = :phone', { phone })
            //     .getOne();

            const queryBuilder = this.db.createQueryBuilder("user");

            if (email) {
                queryBuilder.where("user.email = :email", { email });
            }

            if (phone) {
                queryBuilder.orWhere("user.phone = :phone", { phone });
            }

            const user = await queryBuilder.getOne();


            if (user.status === "blocked") return res.status(HttpCode.UNAUTHORIZED).json({ status: HttpCode.UNAUTHORIZED, message: "Your account was blocked" });
            if (!user) return res.status(HttpCode.UNAUTHORIZED).json({ status: HttpCode.UNAUTHORIZED, message: "Invalid email or password" });

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) return res.status(HttpCode.UNAUTHORIZED).json({ status: HttpCode.UNAUTHORIZED, error: "Invalid email or password" });

            const token = jwtTokens({ userId: user.userId, accountId: user.accountId, name: user.name, email: user.email, status: user.status, role: user.role });
            const data = { name: user.name, email: user.email, role: user.role };
            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, token, data });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const provedAt = new Date(new Date().getTime() + 60000);
            const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const passwordLength = 12;
            let password = "";

            // Generate a random password
            for (let i = 0; i <= passwordLength; i++) {
                let randomNumber = Math.floor(Math.random() * chars.length);
                password += chars.substring(randomNumber, randomNumber + 1);
            }

            // Encrypt password
            const salt = await bcrypt.genSaltSync(10);
            const hashPassword = await bcrypt.hashSync(password, salt);

            // Validate email
            const userAlreadyExisting = await this.db
                .createQueryBuilder("Users")
                .where('email = :email', { email })
                .getOne();

            if (!userAlreadyExisting) throw new AlreadyExistError;

            // Get user data
            const userId = userAlreadyExisting.userId;
            const userEmail = userAlreadyExisting.email;

            // Create a new password
            const createOpt = await this.db
                .createQueryBuilder("Users")
                .update(Users)
                .set({ password: hashPassword, provedAt })
                .where('userId= :userId', { userId })
                .execute();
            if (!createOpt) throw new BadRequestError;

            // Send password to the target
            const to = userEmail;
            const subject = 'New password';
            const html = `<p>Password: ${password}</p>`;
            await sendEmail(to, subject, html);

            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async verifyAuthentication(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, otp } = req.body;
            const verifiedAt = new Date(new Date().getTime() + 600000);
            const currentTime = new Date();
            var userToken = null;

            // Get user data by OTP
            const userData = await this.db
                .createQueryBuilder("Users")
                .where('otp = :otp', { otp: token })
                .getOne();

            // Get user data
            const userId = userData.userId;
            const userOtp = userData.otp;
            const provedAt = userData.provedAt;

            if (provedAt > currentTime) {
                const provedAuth = await bcrypt.compare(otp, userOtp);
                if (provedAuth) {
                    // Verify OTP
                    await this.db
                        .createQueryBuilder("Users")
                        .update(Users)
                        .set({ proveAuth: UserProveAuth.VERIFIED, verifiedAt })
                        .where('userId= :userId', { userId })
                        .execute();

                    // Create new token
                    userToken = jwt.sign({ token: userOtp }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: "10minute",
                    });

                } else {
                    throw new ValidateError;
                }
            } else {
                throw new ExpiredError;
            }

            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, token: userToken });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, password, confirmPassword } = req.body;

            const currentTime = new Date();
            var result = {};
            var userToken = null;

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);
            const hashedConfirmPassword = await bcrypt.hash(confirmPassword, salt);
            if (password.length < 8) return res.status(400).json({ status: 400, message: "Password must less than 8 characters", error: "Bad request" });
            if (hashedPassword !== hashedConfirmPassword) return res.status(400).json({ status: 400, message: "Password not matching", error: "Bad request" });


            // Get user data
            const userData = await this.db
                .createQueryBuilder("Users")
                .where('otp = :otp', { otp: token })
                .getOne();
            const userId = userData.userId;
            const userName = userData.name;
            const userEmail = userData.email;
            const userRole = userData.role;
            const userOtp = userData.otp;
            const verifiedAt = userData.verifiedAt;

            if (verifiedAt > currentTime) {
                // Create new password
                await this.db
                    .createQueryBuilder("Users")
                    .update()
                    .set({ password: hashedPassword })
                    .where('userId = :userId', { userId })
                    .execute();

                // Get user data
                result = await this.db
                    .createQueryBuilder("Users")
                    .where('userId = :userId', { userId })
                    .getOne();


                // Create object
                const userObject = {
                    userId,
                    name: userName,
                    email: userEmail,
                    role: userRole
                };


                // Create new token
                userToken = jwt.sign(userObject, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: "1day",
                });
            } else {
                throw new ExpiredError;
            }

            res.status(HttpCode.SUCCESSFUL).json({ status: HttpCode.SUCCESSFUL, message: HttpMessage.SUCCESSFUL, token: userToken });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;

            jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) throw new NotFoundError;

                const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                res.json({ accessToken });
            });
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(500).json({ message: "Internal server error" });
            }
        }
    }

}
