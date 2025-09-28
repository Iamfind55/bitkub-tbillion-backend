import { AppDataSource } from "../../../config/DataSource";
import { Wallets } from "../entities/Wallets";
import { Users } from "../entities/Users";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { BaseError } from "../helpers/ErrorHandler";
import { HttpCode } from "../helpers/HttpCode";
import { NotFoundError } from "../helpers/ErrorHandler";
import { UserStatus } from "../entities/enums";

export class UserService {
  private db = AppDataSource.getRepository(Users);
  private walletRepository = AppDataSource.getRepository(Wallets);

  async all(
    pageSize,
    page,
    sortBy,
    order,
    startDate,
    endDate,
    roleFilter,
    statusFilter,
    search
  ) {
    let keysToSearch = ["accountId", "name", "email"];

    const queryBuilder = this.db
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.wallet", "wallet")
      .leftJoinAndSelect("user.bank", "bank")
      .leftJoinAndSelect("wallet.transaction", "transaction")
      .leftJoinAndSelect("wallet.trade", "trade")
      .leftJoinAndSelect("wallet.type", "type");

    if (startDate && endDate) {
      queryBuilder.where("user.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    }

    if (statusFilter) {
      queryBuilder.where("user.status = :status", { status: statusFilter });
    }

    if (roleFilter) {
      queryBuilder.where("user.role = :role", { role: roleFilter });
    }

    if (search) {
      keysToSearch.forEach((key) => {
        queryBuilder.orWhere(`user.${key} LIKE :searchTerm`, {
          searchTerm: `%${search}%`,
        });
      });
    }

    const all = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy(`user.${sortBy}`, order)
      .getMany();
    const total = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy(`user.${sortBy}`, order)
      .getCount();
    try {
      return { all, total };
    } catch (error) {
      throw new Error(error);
    }
  }

  async one(id): Promise<Users[]> {
    const one = await this.db
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.profile", "profile")
      .leftJoinAndSelect("user.wallet", "wallet")
      .leftJoinAndSelect("user.bank", "bank")
      .leftJoinAndSelect("wallet.transaction", "transaction")
      .leftJoinAndSelect("wallet.trade", "trade")
      .leftJoinAndSelect("wallet.type", "type")
      .where("user.userId = :userId", { userId: id })
      .getMany();
    try {
      return one;
    } catch (error) {
      throw new Error(error);
    }
  }

  async owner(id): Promise<Users[]> {
    const owner = await this.db
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.profile", "profile")
      .leftJoinAndSelect("user.wallet", "wallet")
      .leftJoinAndSelect("user.bank", "bank")
      // .leftJoinAndSelect('wallet.transaction', 'transaction')
      // .leftJoinAndSelect('wallet.trade', 'trade')
      .leftJoinAndSelect("wallet.type", "type")
      .where({ userId: id })
      .getMany();
    try {
      return owner;
    } catch (error) {
      throw new Error(error);
    }
  }

  async wallet(id): Promise<Wallets[]> {
    const wallet = await this.walletRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.wallet", "wallet")
      .leftJoinAndSelect("user.bank", "bank")
      .leftJoinAndSelect("wallet.transaction", "transaction")
      .leftJoinAndSelect("wallet.trade", "trade")
      .leftJoinAndSelect("wallet.type", "type")
      .where({ userId: id })
      .getMany();
    try {
      return wallet;
    } catch (error) {
      throw new Error(error);
    }
  }

  async add(body: Partial<Users>): Promise<Users> {
    const { name, gender, dob, phone, email, password, address, role } = body;
    const accountId = (Math.floor(Math.random() * 900000) + 100000).toString();
    const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.db
      .createQueryBuilder("Users")
      .insert()
      .into(Users)
      .values({
        accountId,
        name,
        gender,
        dob,
        phone,
        email,
        password: hashedPassword,
        address,
        role,
        status: UserStatus.ACTIVE,
        createdAt,
      })
      .execute();

    const wasCreated = await this.db
      .createQueryBuilder("Users")
      .orderBy("createdAt", "DESC")
      .getOne();
    try {
      return wasCreated;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id, body): Promise<Users> {
    const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
    const { name, gender, status, dob, phone, address } = body;

    // Update
    await this.db
      .createQueryBuilder("Users")
      .update(Users)
      .set({ name, gender, dob, phone, address, status, updatedAt })
      .where("userId = :userId", { userId: id })
      .execute();

    const wasUpdated = await this.db
      .createQueryBuilder("Users")
      .select([
        "Users.userId",
        "Users.name",
        "Users.gender",
        "Users.status",
        "Users.phone",
        "Users.address",
        "Users.updatedAt",
      ])
      .where("userId = :userId", { userId: id })
      .getOne();
    try {
      return await wasUpdated;
    } catch (error) {
      throw new Error(error);
    }
  }

  async approve(id, body): Promise<Users> {
    const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
    const { status } = body;

    // Approved
    await this.db
      .createQueryBuilder("Users")
      .update(Users)
      .set({ status, updatedAt })
      .where("userId = :userId", { userId: id })
      .execute();

    // Returning
    const wasApproved = await this.db
      .createQueryBuilder("Users")
      .select([
        "Users.userId",
        "Users.name",
        "Users.gender",
        "Users.status",
        "Users.phone",
        "Users.address",
        "Users.updatedAt",
      ])
      .where("userId = :userId", { userId: id })
      .getOne();
    try {
      return await wasApproved;
    } catch (error) {
      throw new Error(error);
    }
  }

  async changePassword(id, hashedNewPassword): Promise<Users[]> {
    const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

    await this.db
      .createQueryBuilder("Users")
      .update(Users)
      .set({ password: hashedNewPassword, updatedAt })
      .where("userId = :userId", { userId: id })
      .execute();
    try {
      return await this.one(id);
    } catch (error) {
      throw new Error(error);
    }
  }


  async changeCustomerPassword(id, hashedNewPassword): Promise<Users[]> {
    const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

    await this.db
      .createQueryBuilder("Users")
      .update(Users)
      .set({ password: hashedNewPassword, updatedAt })
      .where("userId = :userId", { userId: id })
      .execute();
    try {
      return await this.one(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  async profile(id, images): Promise<Users[]> {
    const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

    for (const image of images) {
      const {
        filename,
        originalname,
        encoding,
        mimetype,
        destination,
        size,
        path,
      } = image;
      await this.db
        .createQueryBuilder("Users")
        .update(Users)
        .set({
          filename,
          originalname,
          encoding,
          mimetype,
          destination,
          size,
          path,
          updatedAt,
        })
        .where("userId = :userId", { userId: id })
        .execute();
    }

    try {
      return await this.one(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id) {
    await this.db.delete(id);
    await this.db.delete(id);
    try {
      return await this.one(id);
    } catch (error) {
      throw new Error(error);
    }
  }
}
