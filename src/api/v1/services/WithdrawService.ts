import { AppDataSource } from "../../../config/DataSource";
import { Transactions } from "../entities/Transactions";
import moment from "moment";
import { Wallets } from "../entities/Wallets";
import { TransactionStatus, TransactionType, WithdrawStatus } from "../entities/enums";
import { Coupons } from "../entities/Coupons";
import { WalletTypes } from "../entities/WalletTypes";
import { Withdraws } from "../entities/Withdraws";

export class WithdrawService {
    private db = AppDataSource.getRepository(Withdraws);
    private transactionRepository = AppDataSource.getRepository(Transactions);
    private walletRepository = AppDataSource.getRepository(Wallets);
    private couponRepository = AppDataSource.getRepository(Coupons);
    private walletTypeRepository = AppDataSource.getRepository(WalletTypes);

    async all(pageSize, page, sortBy, order, startDate, endDate, typeFilter, statusFilter, search, includedTypes, includedStatuses, excludedTypes, excludedStatuses) {
        let keysToSearch = ['method'];

        const queryBuilder = this.db
            .createQueryBuilder('withdraw')
            .leftJoinAndSelect('withdraw.wallet', 'wallet')
            .leftJoinAndSelect('wallet.user', 'user')
            .select([
                "withdraw.withdrawId",
                "withdraw.name",
                "withdraw.accountName",
                "withdraw.accountNumber",
                "withdraw.amount",
                "withdraw.status",
                "withdraw.createdAt",

                "wallet.walletId",

                "user.userId",
                "user.name",
                "user.gender",
                "user.phone",
                "user.email",
                "user.address",
                "user.filename",
            ]);

        if (startDate && endDate) {
            queryBuilder.where('withdraw.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (statusFilter) {
            queryBuilder.where('withdraw.status = :status', { status: statusFilter });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`withdraw.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }


        const all = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`withdraw.${sortBy}`, order)
            .getMany();
        const total = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`withdraw.${sortBy}`, order)
            .getCount();
        try {
            return { all, total };
        } catch (error) {
            throw new Error(error);
        }
    }

    async withdrawPending(pageSize, page, sortBy, order, startDate, endDate, search) {
        let keysToSearch = ['method'];
        const includedTypes = ["withdraw"];
        const includedStatuses = ["pending"];


        const queryBuilder = this.db
            .createQueryBuilder('withdraw')
            .leftJoinAndSelect('withdraw.wallet', 'wallet')
            .leftJoinAndSelect('wallet.user', 'user')
            .select([
                "withdraw.withdrawId",
                "withdraw.name",
                "withdraw.accountName",
                "withdraw.accountNumber",
                "withdraw.amount",
                "withdraw.status",
                "withdraw.createdAt",

                "wallet.walletId",

                "user.userId",
                "user.name",
                "user.gender",
                "user.phone",
                "user.email",
                "user.address",
                "user.filename",
            ])
            .where('withdraw.status IN (:...includedStatuses)', { includedStatuses });

        if (startDate && endDate) {
            queryBuilder.where('withdraw.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`withdraw.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }


        const all = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`withdraw.${sortBy}`, order)
            .getMany();
        const total = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`withdraw.${sortBy}`, order)
            .getCount();
        try {
            return { all, total };
        } catch (error) {
            throw new Error(error);
        }
    }


    async getWithdrawByOwnerId(userId, walletId, pageSize, page, sortBy, order, startDate, endDate, search) {
        let keysToSearch = ['method'];
        const includedTypes = ['withdraw'];

        const queryBuilder = this.db
            .createQueryBuilder('Withdraws')
            .select([
                "Withdraws.withdrawId",
                "Withdraws.name",
                "Withdraws.accountName",
                "Withdraws.accountNumber",
                "Withdraws.amount",
                "Withdraws.status",
                "Withdraws.createdAt",
            ])
            .andWhere({ userId });

        if (startDate && endDate) {
            queryBuilder.where('Withdraws.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`Withdraws.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }


        const all = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`Withdraws.${sortBy}`, order)
            .getMany();
        const total = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`Withdraws.${sortBy}`, order)
            .getCount();

        try {
            return { all, total };
        } catch (error) {
            throw new Error(error);
        }
    }

    async one(id): Promise<Withdraws[]> {
        const one = await this.db
            .createQueryBuilder('withdraw')
            .leftJoinAndSelect('withdraw.wallet', 'wallet')
            .leftJoinAndSelect('wallet.user', 'user')
            .select([
                "withdraw.withdrawId",
                "withdraw.name",
                "withdraw.accountName",
                "withdraw.accountNumber",
                "withdraw.amount",
                "withdraw.status",
                "withdraw.createdAt",

                "wallet.walletId",

                "user.userId",
                "user.name",
                "user.gender",
                "user.phone",
                "user.email",
                "user.address",
                "user.filename",
            ])
            .where('withdraw.withdrawId = :withdrawId', { withdrawId: id })
            .getMany();
        try {
            return one;
        } catch (error) {
            throw new Error(error);
        }
    }

    async add(walletId, userId, body): Promise<Withdraws> {
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const type = TransactionType.WITHDRAW;
        const status = TransactionStatus.PENDING;
        const name = body.name;
        const accountName = body.accountName;
        const accountNumber = body.accountNumber;
        const amount = body.amount;
        const withdrawStatus = WithdrawStatus.PENDING;
        const method = body.method;
        const createdBy = userId;

        //wallet
        const result = await this.walletRepository
            .createQueryBuilder('Wallets')
            .where({ walletId })
            .getOne();

        await this.walletRepository
            .createQueryBuilder('Wallets')
            .update(Wallets)
            .set({ balance: Math.trunc(result.balance) - Math.trunc(body.amount), updatedAt, createdBy: userId })
            .where("walletId = :walletId", { walletId: walletId })
            .execute();

        // Add new withdraw
        const insertResult = await this.db
            .createQueryBuilder('Withdraws')
            .insert()
            .into(Withdraws)
            .values({ wallet: walletId, name, accountName, accountNumber, amount, status: withdrawStatus, createdAt, createdBy, userId })
            .execute();
        const withdrawId = insertResult.identifiers[0].withdrawId;


        // Add new transaction
        await this.transactionRepository
            .createQueryBuilder('Transactions')
            .insert()
            .into(Transactions)
            .values({ withdraw: withdrawId, wallet: walletId, type, method, amount, status, createdAt, createdBy, userId })
            .execute();


        // Returning
        const wasCreated = await this.db
            .createQueryBuilder('Withdraws')
            .orderBy('createdAt', 'DESC')
            .getOne();


        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }


    async update(id, walletId, body): Promise<Withdraws> {
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const status = body.status;

        // Approved or rejected
        await this.db
            .createQueryBuilder('Withdraws')
            .update(Withdraws)
            .set({ status, updatedAt })
            .where('withdrawId = :id', { id })
            .execute();

        // Transaction
        await this.transactionRepository
            .createQueryBuilder('Transactions')
            .update(Transactions)
            .set({ status, updatedAt })
            .where('withdrawId = :id', { id })
            .execute();

        // Get withdraw info
        const withdraw = await this.db
            .createQueryBuilder('Withdraws')
            .where('withdrawId = :id', { id })
            .getOne();
        const amount = withdraw.amount;


        // wallet get one
        const result = await this.walletRepository
            .createQueryBuilder('Wallets')
            .where({ walletId })
            .getOne();
        const balance = result.balance;


        if (status === 'rejected') {
            await this.walletRepository
                .createQueryBuilder('Wallets')
                .update(Wallets)
                .set({ balance: Math.trunc(balance) + Math.trunc(amount), updatedAt })
                .where({ walletId })
                .execute();
        }

        // Returning
        const wasUpdated = await this.db
            .createQueryBuilder('Withdraws')
            .where('withdrawId = :id', { id })
            .getOne();


        try {
            return wasUpdated;
        } catch (error) {
            throw new Error(error);
        }
    }


    async edit(id, body): Promise<Withdraws> {
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const { name, accountName, accountNumber } = body;

        // Update
        await this.db
            .createQueryBuilder('Withdraws')
            .update(Withdraws)
            .set({ name, accountName, accountNumber, updatedAt })
            .where('withdrawId = :id', { id })
            .execute();

        // Returning
        const wasUpdated = await this.db
            .createQueryBuilder('Withdraws')
            .where('withdrawId = :id', { id })
            .getOne();


        try {
            return wasUpdated;
        } catch (error) {
            throw new Error(error);
        }
    }


    async remove(id) {
        await this.db.delete(id);
        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }
}
