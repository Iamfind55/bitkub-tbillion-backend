import { AppDataSource } from "../../../config/DataSource";
import { Transactions } from "../entities/Transactions";
import moment from "moment";
import { Wallets } from "../entities/Wallets";
import { TransactionStatus, TransactionType } from "../entities/enums";
import { Coupons } from "../entities/Coupons";
import { WalletTypes } from "../entities/WalletTypes";

export class TransactionService {
    private db = AppDataSource.getRepository(Transactions);
    private walletRepository = AppDataSource.getRepository(Wallets);
    private couponRepository = AppDataSource.getRepository(Coupons);
    private walletTypeRepository = AppDataSource.getRepository(WalletTypes);

    async all(pageSize, page, sortBy, order, startDate, endDate, typeFilter, statusFilter, search, includedTypes, includedStatuses, excludedTypes, excludedStatuses) {
        let keysToSearch = ['method'];
        const _includedTypes = ['deposit', 'withdraw', 'trade', 'exchange', 'transfer'];
        const _includedStatuses = ['completed', 'rejected'];
        const _excludedStatuses = ['pending'];

        const queryBuilder = this.db
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.wallet', 'wallet')
            .leftJoinAndSelect('wallet.user', 'user')
            .leftJoinAndSelect('transaction.bank', 'bank')
            .select([
                "transaction.transactionId",
                "transaction.type",
                "transaction.method",
                "transaction.amount",
                "transaction.status",
                "transaction.createdAt",
                "transaction.updatedAt",

                "wallet.walletId",

                "user.userId",
                "user.name",
                "user.gender",
                "user.phone",
                "user.email",
                "user.address",

                "bank.bankId",
                "bank.name",
                "bank.accountName",
                "bank.accountNumber",
            ])
            .where('transaction.type IN (:..._includedTypes)', { _includedTypes })
            .andWhere('transaction.status NOT IN (:..._excludedStatuses)', { _excludedStatuses });

        if (startDate && endDate) {
            queryBuilder.where('transaction.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (typeFilter) {
            queryBuilder
                .where('transaction.type = :type', { type: typeFilter })
                .andWhere('transaction.status IN (:..._includedStatuses)', { _includedStatuses });
        }

        if (statusFilter) {
            queryBuilder.where('transaction.status = :status', { status: statusFilter });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`transaction.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }

        // if (includedTypes) {

        //     queryBuilder
        //         .where('transaction.type IN (:...includedTypes)', { includedTypes });
        // }

        // if (_includedStatuses) {

        //     queryBuilder
        //         .where('transaction.status IN (:..._includedStatuses)', { _includedStatuses });
        // }

        // if (_excludedTypes) {
        //     queryBuilder
        //         .where('transaction.type NOT IN (:..._excludedTypes)', { _excludedTypes });
        // }

        // if (_excludedStatuses) {
        //     queryBuilder
        //         .where('transaction.status NOT IN (:..._excludedStatuses)', { _excludedStatuses });
        // }



        const transaction = await queryBuilder
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
            return { all: transaction, total };
        } catch (error) {
            throw new Error(error);
        }
    }

    async withdrawPending(pageSize, page, sortBy, order, startDate, endDate) {
        let keysToSearch = ['method'];
        const includedTypes = ["withdraw"];
        const includedStatuses = ["pending"];


        const queryBuilder = this.db
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.wallet', 'wallet')
            .leftJoinAndSelect('wallet.user', 'user')
            .leftJoinAndSelect('transaction.bank', 'bank')
            .where('transaction.type IN (:...includedTypes)', { includedTypes })
            .andWhere('transaction.status IN (:...includedStatuses)', { includedStatuses });

        if (startDate && endDate) {
            queryBuilder.where('transaction.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }


        const transaction = await queryBuilder
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
            return { all: transaction, total };
        } catch (error) {
            throw new Error(error);
        }
    }


    async owner(userId, walletId, pageSize, page, sortBy, order) {
        const all = await this.db
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.wallet', 'wallet')
            .leftJoinAndSelect('transaction.bank', 'bank')
            .where({ userId })
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`transaction.${sortBy}`, order)
            .getMany();

        const total = await this.db
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.wallet', 'wallet')
            .leftJoinAndSelect('transaction.bank', 'bank')
            .where({ userId })
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`transaction.${sortBy}`, order)
            .getCount();

        try {
            return { all, total };
        } catch (error) {
            throw new Error(error);
        }
    }

    async getWithdrawByOwnerId(userId, walletId, pageSize, page, sortBy, order) {
        const includedTypes = ['withdraw'];
        const all = await this.db
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.wallet', 'wallet')
            .leftJoinAndSelect('transaction.bank', 'bank')
            .where({ userId })
            .andWhere('transaction.type IN (:...includedTypes)', { includedTypes })
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`transaction.${sortBy}`, order)
            .getMany();

        const total = await this.db
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.wallet', 'wallet')
            .leftJoinAndSelect('transaction.bank', 'bank')
            .where({ userId })
            .andWhere('transaction.type IN (:...includedTypes)', { includedTypes })
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(sortBy, order)
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
            .where('transaction.transactionId = :transactionId', { transactionId: id })
            .getMany();
        try {
            return one;
            // return this.db.findBy({ transactionId: id });
        } catch (error) {
            throw new Error(error);
        }
    }


    async deposit(walletId, body: Partial<Transactions>): Promise<Transactions> {
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

        //wallet
        const result = await this.walletRepository
            .createQueryBuilder('Wallets')
            .where({ walletId })
            .getOne();

        //Coupons
        const coupon = await this.couponRepository
            .createQueryBuilder('Coupons')
            .getOne();

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

        //Make deposit
        await this.db
            .createQueryBuilder('Transactions')
            .insert()
            .into(Transactions)
            .values({ wallet: walletId, type: body.type, method: body.method, amount: body.amount, status: TransactionStatus.COMPLETED, createdAt })
            .execute();


        // let sum = Math.trunc(result.balance) + Math.trunc(body.amount);
        // if (body.amount < 100) throw new HttpError("Can not deposit", 400);

        await this.walletRepository
            .createQueryBuilder('Wallets')
            .update(Wallets)
            .set({ balance: Math.trunc(result.balance) + amount, updatedAt: new Date(moment().format("YYYY-MM-DD HH:mm:ss")) })
            .where("walletId = :walletId", { walletId })
            .execute();


        const wasCreated = await this.db
            .createQueryBuilder('Transactions')
            .orderBy('createdAt', 'DESC')
            .getOne();

        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }


    async withdraw(walletId, body: Partial<Transactions>): Promise<Transactions> {
        const withdraw = this.db.create(body);
        withdraw.wallet = walletId;
        withdraw.status = TransactionStatus.PENDING;
        withdraw.createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

        //wallet
        const result = await this.walletRepository
            .createQueryBuilder('Wallets')
            .where({ walletId })
            .getOne();


        // let sum = Math.trunc(result.balance) + Math.trunc(body.amount);

        if (result.balance < 100) throw new Error("Can not withdraw");

        await this.walletRepository
            .createQueryBuilder('Wallets')
            .update(Wallets)
            .set({ balance: Math.trunc(result.balance) - Math.trunc(body.amount), updatedAt: new Date(moment().format("YYYY-MM-DD HH:mm:ss")) })
            .where("walletId = :walletId", { walletId: walletId })
            .execute();

        try {
            return this.db.save(withdraw);
        } catch (error) {
            throw new Error(error);
        }
    }


    async exchange(walletId, body): Promise<Transactions> {
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

        const baseWalletId = body.baseWalletId;
        const targetWalletId = body.targetWalletId;


        //Base wallet
        const baseWallet = await this.walletRepository
            .createQueryBuilder('wallet')
            .leftJoinAndSelect('wallet.walletTypeId', 'walletTypeId')
            .where('wallet.walletId = :walletId', { walletId: baseWalletId })
            .getOne();
        // const rate = baseWallet.type.rate;
        const rate = 1;

        //wallet
        const result = await this.walletRepository
            .createQueryBuilder('Wallets')
            .where({ walletId })
            .getOne();


        //Make exchange
        await this.db
            .createQueryBuilder('Transactions')
            .insert()
            .into(Transactions)
            .values({ baseWalletId, targetWalletId, type: TransactionType.EXCHANGE, amount: body.amount, status: TransactionStatus.COMPLETED, createdAt })
            .execute();


        // let sum = Math.trunc(result.balance) + Math.trunc(body.amount);
        // if (body.amount < 100) throw new HttpError("Can not deposit", 400);

        await this.walletRepository
            .createQueryBuilder('Wallets')
            .update(Wallets)
            .set({ balance: Math.trunc(result.balance) + Math.trunc(body.amount * rate), updatedAt: new Date(moment().format("YYYY-MM-DD HH:mm:ss")) })
            .where("walletId = :walletId", { walletId: targetWalletId })
            .execute();


        const wasCreated = await this.db
            .createQueryBuilder('Transactions')
            .orderBy('createdAt', 'DESC')
            .getOne();

        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }

    add(body: Partial<Transactions>): Promise<Transactions> {
        const add = this.db.create(body);
        add.createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        try {
            return this.db.save(add);
        } catch (error) {
            throw new Error(error);
        }
    }


    async approve(id, walletId, body: Partial<Transactions>): Promise<Transactions[]> {
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const status = body.status;

        await this.db
            .createQueryBuilder('Transactions')
            .update(Transactions)
            .set({ status, updatedAt })
            .where('transactionId = :transactionId', { transactionId: id })
            .execute();

        //wallet
        const transaction = await this.db
            .createQueryBuilder('Transactions')
            .where('transactionId = :transactionId', { transactionId: id })
            .getOne();
        const amount = transaction.amount;


        //wallet get one
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

        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }

    async update(id, walletId, body): Promise<Transactions[]> {
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const status = body.status;

        await this.db
            .createQueryBuilder('Transactions')
            .update(Transactions)
            .set({ status, updatedAt })
            .where('transactionId = :transactionId', { transactionId: id })
            .execute();

        //wallet
        const transaction = await this.db
            .createQueryBuilder('Transactions')
            .where('transactionId = :transactionId', { transactionId: id })
            .getOne();
        const amount = transaction.amount;


        //wallet get one
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

        try {
            return await this.one(id);
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
