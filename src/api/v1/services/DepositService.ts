import { AppDataSource } from "../../../config/DataSource";
import { Transactions } from "../entities/Transactions";
import moment from "moment";
import { Wallets } from "../entities/Wallets";
import { TransactionStatus, TransactionType } from "../entities/enums";
import { Coupons } from "../entities/Coupons";
import { WalletTypes } from "../entities/WalletTypes";

export class DepositService {
    private db = AppDataSource.getRepository(Transactions);
    private walletRepository = AppDataSource.getRepository(Wallets);
    private couponRepository = AppDataSource.getRepository(Coupons);
    private walletTypeRepository = AppDataSource.getRepository(WalletTypes);

    async all(pageSize, page, sortBy, order, startDate, endDate, typeFilter, statusFilter, search, includedTypes, includedStatuses, excludedTypes, excludedStatuses) {
        let keysToSearch = ['method'];
        const _includedTypes = ['deposit'];

        const queryBuilder = this.db
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.wallet', 'wallet')
            .leftJoinAndSelect('wallet.user', 'user')
            .leftJoinAndSelect('wallet.type', 'type')
            .select([
                "transaction.transactionId",
                "transaction.type",
                "transaction.method",
                "transaction.amount",
                "transaction.status",
                "transaction.createdAt",

                "wallet.walletId",

                "type.name",

                "user.userId",
                "user.name",
                "user.gender",
                "user.phone",
                "user.email",
                "user.address",
            ])
            .where('transaction.type IN (:..._includedTypes)', { _includedTypes });

        if (startDate && endDate) {
            queryBuilder.where('transaction.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (statusFilter) {
            queryBuilder.where('transaction.status = :status', { status: statusFilter });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`transaction.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }


        const deposits = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`transaction.${sortBy}`, order)
            .getMany();
        const total = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`transaction.${sortBy}`, order)
            .getCount();
        try {
            return { all: deposits, total };
        } catch (error) {
            throw new Error(error);
        }
    }

    async getDepositByOwnerId(userId, walletId, pageSize, page, sortBy, order, startDate, endDate, search) {
        let keysToSearch = ['method'];
        const includedTypes = ['deposit'];

        const queryBuilder = this.db
            .createQueryBuilder('Transactions')
            .select([
                "Transactions.transactionId",
                "Transactions.type",
                "Transactions.method",
                "Transactions.amount",
                "Transactions.status",
                "Transactions.createdAt",
            ])
            .where('Transactions.type IN (:...includedTypes)', { includedTypes })
            .andWhere({ userId });

        if (startDate && endDate) {
            queryBuilder.where('Transactions.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`Transactions.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }


        const all = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`Transactions.${sortBy}`, order)
            .getMany();
        const total = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`Transactions.${sortBy}`, order)
            .getCount();

        try {
            return { all, total };
        } catch (error) {
            throw new Error(error);
        }
    }


    async one(id): Promise<Transactions[]> {
        const one = await this.db
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.wallet', 'wallet')
            // .leftJoinAndSelect('wallet.type', 'type')
            .leftJoinAndSelect('wallet.user', 'user')
            .leftJoinAndSelect('transaction.bank', 'bank')
            .select([
                "transaction.transactionId",
                "transaction.type",
                "transaction.method",
                "transaction.amount",
                "transaction.status",
                "transaction.createdAt",

                "wallet.walletId",

                "user.userId",
                "user.name",
                "user.gender",
                "user.phone",
                "user.email",
                "user.address",
            ])
            .where('transaction.transactionId = :transactionId', { transactionId: id })
            .getMany();
        try {
            return one;
        } catch (error) {
            throw new Error(error);
        }
    }


    async add(walletId, userId, body): Promise<Transactions> {
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

        // Get wallet data
        const result = await this.walletRepository
            .createQueryBuilder('Wallets')
            .where({ walletId })
            .getOne();

        // Get coupon data
        const coupon = await this.couponRepository
            .createQueryBuilder('Coupons')
            .getOne();

        // Coupon is available
        if (coupon !== null) {
            const percent = coupon.percent;
            const startDate = coupon.startDate;
            const endDate = coupon.endDate;
            var amount = Math.trunc(body.amount);
            if (endDate > startDate) {
                amount = amount + (amount * percent / 100);
            } else {
                amount = amount;
            }
        } else {
            amount = Math.trunc(body.amount);
        }

        //Make deposit transaction
        await this.db
            .createQueryBuilder('Transactions')
            .insert()
            .into(Transactions)
            .values({ wallet: walletId, type: body.type, method: body.method, amount: body.amount, status: TransactionStatus.COMPLETED, createdAt, createdBy: userId, userId })
            .execute();


        // Add deposit to wallet
        await this.walletRepository
            .createQueryBuilder('Wallets')
            .update(Wallets)
            .set({ balance: Math.trunc(result.balance) + amount, updatedAt, createdBy: userId })
            .where("walletId = :walletId", { walletId })
            .execute();

        // Returning
        const wasCreated = await this.db
            .createQueryBuilder('Transactions')
            .select([
                "Transactions.transactionId",
                "Transactions.type",
                "Transactions.method",
                "Transactions.amount",
                "Transactions.status",
                "Transactions.createdAt",
            ])
            .orderBy('createdAt', 'DESC')
            .getOne();

        try {
            return wasCreated;
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
