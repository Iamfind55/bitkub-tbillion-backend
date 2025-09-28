import { AppDataSource } from "../../../config/DataSource";
import { Transactions } from "../entities/Transactions";
import moment from "moment";
import { CoinStatus, CoinType, TransactionStatus, TransactionType, WithdrawStatus } from "../entities/enums";
import { Coins } from "../entities/Coins";
import { WalletTypes } from "../entities/WalletTypes";
import { Wallets } from "../entities/Wallets";

export class CoinService {
    private db = AppDataSource.getRepository(Coins);
    private transactionRepository = AppDataSource.getRepository(Transactions);
    private walletTypeRepository = AppDataSource.getRepository(WalletTypes);
    private walletRepository = AppDataSource.getRepository(Wallets);

    async all(pageSize, page, sortBy, order, startDate, endDate, typeFilter, statusFilter, search, includedTypes, includedStatuses, excludedTypes, excludedStatuses) {
        let keysToSearch = ['name'];

        const queryBuilder = this.db
            .createQueryBuilder('coin')
            .leftJoinAndSelect('coin.user', 'user')
            .select([
                "coin.coinId",
                "coin.name",
                "coin.amount",
                "coin.image",
                "coin.type",
                "coin.status",
                "coin.createdAt",

                "user.userId",
                "user.name",
                "user.gender",
                "user.phone",
                "user.email",
                "user.address",
                "user.filename",
            ]);

        if (startDate && endDate) {
            queryBuilder.where('coin.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (statusFilter) {
            queryBuilder.where('coin.status = :status', { status: statusFilter });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`coin.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }


        const all = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`coin.${sortBy}`, order)
            .getMany();
        const total = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`coin.${sortBy}`, order)
            .getCount();
        try {
            return { all, total };
        } catch (error) {
            throw new Error(error);
        }
    }



    async getCoinByOwnerId(userId, pageSize, page, sortBy, order, startDate, endDate, search) {
        let keysToSearch = ['name'];

        const queryBuilder = this.db
            .createQueryBuilder('Coins')
            .select([
                "Coins.coinId",
                "Coins.name",
                "Coins.amount",
                "Coins.image",
                "Coins.type",
                "Coins.status",
                "Coins.createdAt",
                "Coins.updatedAt",
            ])

            .andWhere({ user: userId });

        if (startDate && endDate) {
            queryBuilder.where('Coins.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`Coins.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }


        const all = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`Coins.${sortBy}`, order)
            .getMany();
        const total = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`Coins.${sortBy}`, order)
            .getCount();

        try {
            return { all, total };
        } catch (error) {
            throw new Error(error);
        }
    }

    async one(id): Promise<Coins[]> {
        const one = await this.db
            .createQueryBuilder('coin')
            .leftJoinAndSelect('coin.transaction', 'transaction')
            .leftJoinAndSelect('coin.user', 'user')
            .select([
                "coin.coinId",
                "coin.name",
                "coin.amount",
                "coin.image",
                "coin.status",
                "coin.createdAt",


                "transaction.transactionId",
                "transaction.type",


                "user.userId",
                "user.name",
                "user.gender",
                "user.phone",
                "user.email",
                "user.address",
                "user.filename",
            ])
            .where('coin.coinId = :coinId', { coinId: id })
            .getMany();
        try {
            return one;
        } catch (error) {
            throw new Error(error);
        }
    }

    async add(userId, images, body): Promise<Coins> {
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const name = body.name;
        const code = body.name;
        const accountNumber = body.accountNumber;
        const amount = body.amount;
        const createdBy = userId;



        for (const image of images) {
            const { filename, path } = image;

            // Wallet type
            let walletTypeId = null;
            const walletTypeExisting = await this.walletTypeRepository
                .createQueryBuilder("WalletTypes")
                .where('code = :code', { code })
                .getOne();


            // Validation wallet type
            if (!walletTypeExisting) {
                const insertWalletType = await this.walletTypeRepository
                    .createQueryBuilder("WalletTypes")
                    .insert()
                    .into(WalletTypes)
                    .values({ name, code, rate: 1, createdAt })
                    .execute();
                walletTypeId = insertWalletType.identifiers[0].walletTypeId;


            } else {
                // Get wallet type id
                const walletType = await this.walletTypeRepository
                    .createQueryBuilder("WalletTypes")
                    .where('code = :code', { code })
                    .getOne();

                walletTypeId = walletType.walletTypeId;

            }



            // Get wallet
            let walletId = null;
            const walletExisting = await this.walletRepository
                .createQueryBuilder("Wallets")
                .where('walletTypeId = :walletTypeId', { walletTypeId })
                .andWhere('userId = :userId', { userId })
                .getOne();

            if (!walletExisting) {
                // Create new wallet account
                const insertWallet = await this.walletRepository
                    .createQueryBuilder("Wallets")
                    .insert()
                    .into(Wallets)
                    // .values({ type: walletTypeId, user: userId, balance: amount, createdAt })
                    .values({ type: walletTypeId, user: userId, createdAt })
                    .execute();
                walletId = insertWallet.identifiers[0].walletId;
            } else {
                const wallet = await this.walletRepository
                    .createQueryBuilder("Wallets")
                    .where('walletTypeId = :walletTypeId', { walletTypeId })
                    .getOne();
                const balance = wallet.balance;
                walletId = wallet.walletId;

                // Update
                // await this.db
                //     .createQueryBuilder('Wallets')
                //     .update(Wallets)
                //     .set({ balance: Math.trunc(balance) + Math.trunc(amount), updatedAt })
                //     .where('walletTypeId = :walletTypeId', { walletTypeId })
                //     .execute();
            }


            // Add coin
            const insertResult = await this.db
                .createQueryBuilder('Coins')
                .insert()
                .into(Coins)
                .values({ wallet: walletId, user: userId, name, accountNumber, amount, image: filename, path, type: CoinType.DEPOSIT, status: CoinStatus.PENDING, createdAt, createdBy })
                .execute();
            const coinId = insertResult.identifiers[0].coinId;


            // Add new transaction
            await this.transactionRepository
                .createQueryBuilder('Transactions')
                .insert()
                .into(Transactions)
                .values({ wallet: walletId, coin: coinId, type: TransactionType.COIN, amount, status: TransactionStatus.COMPLETED, createdAt, createdBy, userId })
                .execute();

        }

        // Returning
        const wasCreated = await this.db
            .createQueryBuilder('Coins')
            .orderBy('createdAt', 'DESC')
            .getOne();

        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }


    async withdraw(userId, body): Promise<Coins> {
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const type = TransactionType.COIN;
        const status = TransactionStatus.PENDING;
        const name = body.name;
        const accountNumber = body.accountNumber;
        const amount = body.amount;
        const method = body.method;
        const walletId = body.walletId;
        const createdBy = userId;

        //wallet
        const result = await this.walletRepository
            .createQueryBuilder('wallet')
            .leftJoinAndSelect('wallet.type', 'type')
            .where({ walletId })
            .getOne();
        const walletTypeId = result.type.walletTypeId;


        // Get wallet type

        const walletType = await this.walletTypeRepository
            .createQueryBuilder("WalletTypes")
            .where({ walletTypeId })
            .getOne();
        const walletTypeName = walletType.name;

        // Update wallet
        await this.walletRepository
            .createQueryBuilder('Wallets')
            .update(Wallets)
            .set({ balance: Math.trunc(result.balance) - Math.trunc(body.amount), updatedAt, createdBy: userId })
            .where("walletId = :walletId", { walletId: walletId })
            .execute();

        // Add new coin
        const insertResult = await this.db
            .createQueryBuilder('Coins')
            .insert()
            .into(Coins)
            .values({ wallet: walletId, name: walletTypeName, amount, type: CoinType.WITHDRAW, status: CoinStatus.PENDING, createdAt, createdBy, user: userId })
            .execute();
        const coinId = insertResult.identifiers[0].coinId;




        // Add new transaction
        await this.transactionRepository
            .createQueryBuilder('Transactions')
            .insert()
            .into(Transactions)
            .values({ coin: coinId, wallet: walletId, type, method, amount, status, createdAt, createdBy, userId })
            .execute();


        // Returning
        const wasCreated = await this.db
            .createQueryBuilder('Coins')
            .orderBy('createdAt', 'DESC')
            .getOne();


        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }


    async update(id, images, body): Promise<Coins> {
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const status = body.status;
        const amount = body.amount;


        // Update
        for (const image of images) {
            const { filename, path } = image;
            await this.db
                .createQueryBuilder('Coins')
                .update(Coins)
                .set({ amount, status, image: filename, path, updatedAt })
                .where('coinId = :id', { id })
                .execute();
        }

        // Returning
        const wasUpdated = await this.db
            .createQueryBuilder('Coins')
            .where('coinId = :id', { id })
            .getOne();

        try {
            return wasUpdated;
        } catch (error) {
            throw new Error(error);
        }
    }


    async approve(id, body): Promise<Coins> {
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const status = body.status;


        const coin = await this.db
            .createQueryBuilder("coin")
            .leftJoinAndSelect('coin.wallet', 'wallet')
            .where('coinId = :id', { id })
            .getOne();


        const walletId = coin.wallet.walletId;
        const amount = coin.amount;
        const type = coin.type;



        // Wallet
        const wallet = await this.walletRepository
            .createQueryBuilder("Wallets")
            .where({ walletId })
            .getOne();
        const balance = wallet.balance;

        // Approved deposit
        if (status === "completed" && type === "deposit") {
            await this.db
                .createQueryBuilder('Wallets')
                .update(Wallets)
                .set({ balance: Math.trunc(balance) + Math.trunc(amount), updatedAt })
                .where({ walletId })
                .execute();
        }


        // Rejected withdraw
        if (status === "rejected" && type === "withdraw") {
            await this.db
                .createQueryBuilder('Wallets')
                .update(Wallets)
                .set({ balance: Math.trunc(balance) + Math.trunc(amount), updatedAt })
                .where({ walletId })
                .execute();
        }

        // Update coin
        await this.db
            .createQueryBuilder('Coins')
            .update(Coins)
            .set({ status, updatedAt })
            .where('coinId = :id', { id })
            .execute();

        // Returning
        const wasUpdated = await this.db
            .createQueryBuilder('Coins')
            .where('coinId = :id', { id })
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
