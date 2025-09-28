import { AppDataSource } from "../../../config/DataSource";
import { Trades } from "../entities/Trades";
import moment from "moment";
import { Wallets } from "../entities/Wallets";
import { Durations } from "../entities/Durations";
import { Transactions } from "../entities/Transactions";
import { TradeStatus, TransactionStatus, TransactionType } from "../entities/enums";

export class TradeService {
    private db = AppDataSource.getRepository(Trades);
    private walletRepository = AppDataSource.getRepository(Wallets);
    private durationRepository = AppDataSource.getRepository(Durations);
    private transactionRepository = AppDataSource.getRepository(Transactions);

    async all(pageSize, page, sortBy, order, startDate, endDate, typeFilter, statusFilter, search, typeNotIn, statusNotIn) {

        let keysToSearch = ['type', 'percent'];
        const excludeTypes = [typeNotIn];
        const excludeStatus = [statusNotIn];

        const queryBuilder = this.db
            .createQueryBuilder('trade')
            .leftJoinAndSelect('trade.wallet', 'wallet')
            .leftJoinAndSelect('wallet.user', 'user')
            .leftJoinAndSelect('trade.duration', 'duration')
            .select([
                "trade.tradeId",
                "trade.type",
                "trade.trade",
                "trade.percent",
                "trade.quantity",
                "trade.price",
                "trade.startDate",
                "trade.endDate",
                "trade.isTrade",
                "trade.isTransfer",
                "trade.status",
                "trade.createdAt",
                "trade.updatedAt",

                "wallet.walletId",

                "user.userId",
                "user.name",
                "user.gender",
                "user.phone",
                "user.email",
                "user.address",

                "duration.durationId",
                "duration.number",
                "duration.unit",
                "duration.minPrice",
            ])
            // .where('trade.isTransfer = :isTransfer', { isTransfer: false })
            .where('trade.isTrade = :isTrade', { isTrade: false });

        if (startDate && endDate) {
            queryBuilder.where('trade.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (typeFilter) {
            queryBuilder
                .where('trade.type = :type', { type: typeFilter })
                .andWhere('trade.status = :status', { status: statusFilter });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`trade.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }

        if (typeNotIn) {
            queryBuilder
                .where('trade.type NOT IN (:...excludeTypes)', { excludeTypes });
        }

        if (statusNotIn) {
            queryBuilder
                .where('trade.status NOT IN (:...excludeStatus)', { excludeStatus });
        }

        if (typeNotIn && statusNotIn) {
            queryBuilder
                .where('trade.type NOT IN (:...excludeTypes)', { excludeTypes })
                .andWhere('trade.status NOT IN (:...excludeStatus)', { excludeStatus });
        }

        const all = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`trade.${sortBy}`, order)
            .getMany();

        const total = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`trade.${sortBy}`, order)
            .getCount();
        try {
            return { all, total };
        } catch (error) {
            throw new Error(error);
        }
    }

    async trading(pageSize, page, sortBy, order, startDate, endDate, typeFilter, statusFilter, search, typeNotIn, statusNotIn) {
        let keysToSearch = ['type', 'percent'];
        const excludeTypes = [typeNotIn];
        const excludeStatus = [statusNotIn];


        const queryBuilder = this.db
            .createQueryBuilder('trade')
            .leftJoinAndSelect('trade.wallet', 'wallet')
            .leftJoinAndSelect('wallet.user', 'user')
            .leftJoinAndSelect('trade.duration', 'duration')
            .select([
                "trade.tradeId",
                "trade.type",
                "trade.trade",
                "trade.percent",
                "trade.quantity",
                "trade.price",
                "trade.startDate",
                "trade.endDate",
                "trade.isTrade",
                "trade.isTransfer",
                "trade.status",
                "trade.createdAt",
                "trade.updatedAt",

                "wallet.walletId",

                "user.userId",
                "user.name",
                "user.gender",
                "user.phone",
                "user.email",
                "user.address",

                "duration.durationId",
                "duration.number",
                "duration.unit",
                "duration.minPrice",
            ])
            // .where('trade.isTransfer = :isTransfer', { isTransfer: false })
            .where('trade.isTrade = :isTrade', { isTrade: true });

        if (startDate && endDate) {
            queryBuilder.where('trade.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (typeFilter) {
            queryBuilder
                .where('trade.type = :type', { type: typeFilter })
                .andWhere('trade.status = :status', { status: statusFilter });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`trade.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }

        if (typeNotIn) {
            queryBuilder
                .where('trade.type NOT IN (:...excludeTypes)', { excludeTypes });
        }

        if (statusNotIn) {
            queryBuilder
                .where('trade.status NOT IN (:...excludeStatus)', { excludeStatus });
        }

        if (typeNotIn && statusNotIn) {
            queryBuilder
                .where('trade.type NOT IN (:...excludeTypes)', { excludeTypes })
                .andWhere('trade.status NOT IN (:...excludeStatus)', { excludeStatus });
        }

        const trade = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`trade.${sortBy}`, order)
            .getMany();

        const total = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`trade.${sortBy}`, order)
            .getCount();
        try {
            return { all: trade, total };
        } catch (error) {
            throw new Error(error);
        }
    }

    async owner(userId, walletId, pageSize, page, sortBy, order) {
        const all = await this.db
            .createQueryBuilder('trade')
            .leftJoinAndSelect('trade.wallet', 'wallet')
            .leftJoinAndSelect('wallet.transaction', 'transaction')
            .leftJoinAndSelect('trade.duration', 'duration')
            .where({ userId })
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`trade.${sortBy}`, order)
            .getMany();

        const total = await this.db
            .createQueryBuilder('Trades')
            .where({ userId })
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

    async getTradesByOwnerId(userId, walletId, pageSize, page, sortBy, order) {
        const all = await this.db
            .createQueryBuilder('trade')
            .leftJoinAndSelect('trade.wallet', 'wallet')
            .leftJoinAndSelect('wallet.transaction', 'transaction')
            .leftJoinAndSelect('trade.duration', 'duration')
            .where({ userId })
            // .andWhere('isTrade = :isTrade', { isTrade: 1 })
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`trade.${sortBy}`, order)
            .getMany();

        const total = await this.db
            .createQueryBuilder('Trades')
            .where({ userId })
            // .andWhere('isTrade = :isTrade', { isTrade: 1 })
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

    async getLastTradeByOwnerId(userId, walletId) {
        const one = await this.db
            .createQueryBuilder('trade')
            .where({ userId })
            .orderBy('trade.createdAt', 'DESC')
            .getOne();
        try {
            return { one };
        } catch (error) {
            throw new Error(error);
        }
    }

    async one(id): Promise<Trades[]> {
        const one = await this.db
            .createQueryBuilder('trade')
            .leftJoinAndSelect('trade.wallet', 'wallet')
            .leftJoinAndSelect('wallet.transaction', 'transaction')
            .leftJoinAndSelect('trade.duration', 'duration')
            .where('trade.tradeId = :tradeId', { tradeId: id })
            .getMany();
        try {
            return one;
        } catch (error) {
            throw new Error(error);
        }
    }

    async add(walletId, userId, body: Partial<Trades>): Promise<Trades> {
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const type = body.type;
        const trade = body.trade;
        const quantity = body.quantity;
        const isTransfer = body.isTransfer;
        const isTrade = body.isTrade;

        //durations
        const duration = await this.durationRepository
            .createQueryBuilder('Durations')
            .where({ durationId: body.duration })
            .getOne();
        var number = duration.number;
        const unit = duration.unit;
        const percent = duration.percent;
        const minPrice = duration.minPrice;
        const maxPrice = duration.maxPrice;


        //Calculate duration for trade
        var now = new Date();
        var startDate = new Date();
        var endDate = null;
        if (unit === "second") {
            //second
            endDate = new Date(now.getTime() + number * 1000);
        }

        if (unit === "minute") {
            //hour
            endDate = new Date(now.getTime() + number * 60000);
        }

        if (unit === "hour") {
            //hour
            endDate = new Date(now.getTime() + number * 3600000);
        }

        if (unit === "day") {
            //day
            endDate = new Date(now.getTime() + number * 86400000);
        }

        if (unit === "week") {
            //week
            endDate = new Date(now.getTime() + number * 604800000);
        }

        if (unit === "month") {
            //month
            endDate = new Date(now.getFullYear(), now.getMonth() + number, now.getDate());
        }

        if (unit === "year") {
            //year
            endDate = new Date(now.getFullYear() + number, now.getMonth(), now.getDate());
        }

        // Withdraw amount from wallet
        const wallet = await this.walletRepository
            .createQueryBuilder('Wallets')
            .where({ walletId })
            .getOne();
        const balance = wallet.balance;

        await this.walletRepository
            .createQueryBuilder('Wallets')
            .update(Wallets)
            .set({ balance: Math.trunc(balance) - Math.trunc(quantity), updatedAt })
            .where("walletId = :walletId", { walletId: walletId })
            .execute();




        //Create trade
        const price = quantity * percent / 100;

        const tradeStatus = TradeStatus.PENDING;
        await this.db
            .createQueryBuilder('Trades')
            .insert()
            .into(Trades)
            .values({ duration: body.duration, wallet, type, trade, percent, quantity, price, startDate, endDate, status: tradeStatus, number, unit, createdAt, createdBy: userId, userId })
            .execute();


        //Create transaction
        const trades = await this.db
            .createQueryBuilder('Trades')
            .orderBy('createdAt', 'DESC')
            .getOne();
        const tradeId = trades.tradeId;

        await this.transactionRepository
            .createQueryBuilder('Transactions')
            .insert()
            .into(Transactions)
            .values({ wallet: walletId, type: TransactionType.TRADE, amount: quantity, status: TransactionStatus.COMPLETED, createdAt, userId })
            .execute();


        // Return
        const wasCreated = await this.db
            .createQueryBuilder('Trades')
            .orderBy('createdAt', 'DESC')
            .getOne();

        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }


    async pending(walletId, userId, body: Partial<Trades>): Promise<Trades> {
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const type = body.type;
        const trade = body.trade;
        const quantity = body.quantity;
        const isTransfer = body.isTransfer;
        const isTrade = body.isTrade;

        //durations
        const duration = await this.durationRepository
            .createQueryBuilder('Durations')
            .where({ durationId: body.duration })
            .getOne();
        var number = duration.number;
        const unit = duration.unit;
        const percent = duration.percent;
        const minPrice = duration.minPrice;
        const maxPrice = duration.maxPrice;


        //Calculate duration for trade
        var now = new Date();
        var startDate = new Date();
        var endDate = null;
        if (unit === "second") {
            //second
            endDate = new Date(now.getTime() + number * 1000);
        }

        if (unit === "minute") {
            //hour
            endDate = new Date(now.getTime() + number * 60000);
        }

        if (unit === "hour") {
            //hour
            endDate = new Date(now.getTime() + number * 3600000);
        }

        if (unit === "day") {
            //day
            endDate = new Date(now.getTime() + number * 86400000);
        }

        if (unit === "week") {
            //week
            endDate = new Date(now.getTime() + number * 604800000);
        }

        if (unit === "month") {
            //month
            endDate = new Date(now.getFullYear(), now.getMonth() + number, now.getDate());
        }

        if (unit === "year") {
            //year
            endDate = new Date(now.getFullYear() + number, now.getMonth(), now.getDate());
        }

        // Withdraw amount from wallet
        const wallet = await this.walletRepository
            .createQueryBuilder('Wallets')
            .where({ walletId })
            .getOne();
        const balance = wallet.balance;

        await this.walletRepository
            .createQueryBuilder('Wallets')
            .update(Wallets)
            .set({ balance: Math.trunc(balance) - Math.trunc(quantity), updatedAt })
            .where("walletId = :walletId", { walletId: walletId })
            .execute();




        //Create trade
        const price = quantity * percent / 100;

        const tradeStatus = TradeStatus.LOST;
        await this.db
            .createQueryBuilder('Trades')
            .insert()
            .into(Trades)
            .values({ duration: body.duration, wallet, type, trade, percent, quantity, price, startDate, endDate, status: tradeStatus, createdAt, createdBy: userId })
            .execute();


        //Create transaction
        const trades = await this.db
            .createQueryBuilder('Trades')
            .orderBy('createdAt', 'DESC')
            .getOne();
        const tradeId = trades.tradeId;

        await this.transactionRepository
            .createQueryBuilder('Transactions')
            .insert()
            .into(Transactions)
            .values({ wallet: walletId, type: TransactionType.TRADE, amount: quantity, status: TransactionStatus.COMPLETED, createdAt })
            .execute();



        // Return
        const wasCreated = await this.db
            .createQueryBuilder('Trades')
            .orderBy('createdAt', 'DESC')
            .getOne();
        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }




    //Manage Trade
    async approve(id, walletId, body): Promise<Trades[]> {
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const status = body.status;

        //trades
        const trades = await this.db
            .createQueryBuilder('Trades')
            .where('tradeId = :tradeId', { tradeId: id })
            .getOne();
        const quantity = trades.quantity;
        const price = trades.price;


        // if (status !== null) throw new Error("Can not update");

        //trade
        await this.db
            .createQueryBuilder('Trades')
            .update(Trades)
            .set({ status: body.status, updatedAt })
            .where('tradeId = :tradeId', { tradeId: id })
            .execute();



        //wallet
        // const result = await this.walletRepository
        //     .createQueryBuilder('Wallets')
        //     .where({ walletId })
        //     .getOne();
        // const balance = result.balance;

        // if (status === "win") {
        //     await this.walletRepository
        //         .createQueryBuilder('Wallets')
        //         .update(Wallets)
        //         .set({ balance: Math.trunc(balance) + Math.trunc(quantity) + Math.trunc(price), updatedAt: new Date(moment().format("YYYY-MM-DD HH:mm:ss")) })
        //         .where({ walletId })
        //         .execute();
        // }

        // if (status === "lost") {
        //     await this.walletRepository
        //         .createQueryBuilder('Wallets')
        //         .update(Wallets)
        //         .set({ balance: Math.trunc(balance), updatedAt: new Date(moment().format("YYYY-MM-DD HH:mm:ss")) })
        //         .where({ walletId })
        //         .execute();
        // }

        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }


    // Transfer
    async transfer(id, walletId, body): Promise<Trades[]> {
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const isTransfer = body.isTransfer;


        // Get trade data
        const trades = await this.db
            .createQueryBuilder('Trades')
            .where('tradeId = :tradeId', { tradeId: id })
            .getOne();
        const quantity = trades.quantity;
        const price = trades.price;
        const status = trades.status;


        // Update transfer status
        await this.db
            .createQueryBuilder('Trades')
            .update(Trades)
            .set({ isTransfer, updatedAt })
            .where('tradeId = :tradeId', { tradeId: id })
            .execute();


        // Get wallet data
        const result = await this.walletRepository
            .createQueryBuilder('Wallets')
            .where({ walletId })
            .getOne();
        const balance = result.balance;

        if (status === "win") {
            await this.walletRepository
                .createQueryBuilder('Wallets')
                .update(Wallets)
                .set({ balance: Math.trunc(balance) + Math.trunc(quantity) + Math.trunc(price), updatedAt: new Date(moment().format("YYYY-MM-DD HH:mm:ss")) })
                .where({ walletId })
                .execute();
        }

        if (status === "lost") {
            await this.walletRepository
                .createQueryBuilder('Wallets')
                .update(Wallets)
                .set({ balance: Math.trunc(balance), updatedAt: new Date(moment().format("YYYY-MM-DD HH:mm:ss")) })
                .where({ walletId })
                .execute();
        }

        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }


    async update(id, body): Promise<Trades[]> {
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        const isTransfer = body.isTransfer;
        const isTrade = body.isTrade;

        //trade
        await this.db
            .createQueryBuilder('Trades')
            .update(Trades)
            .set({ isTransfer, isTrade, updatedAt })
            .where('tradeId = :tradeId', { tradeId: id })
            .execute();

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
