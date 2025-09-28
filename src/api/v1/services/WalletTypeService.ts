import { AppDataSource } from "../../../config/DataSource";
import moment from "moment";
import { WalletTypes } from "../entities/WalletTypes";

export class WalletTypeService {
    private db = AppDataSource.getRepository(WalletTypes);
    async all(pageSize, page, sortBy, order, startDate, endDate, search, statusFilter) {
        let all = [];
        let total = 0;
        let query = this.db
            .createQueryBuilder('WalletTypes');

        all = await query
            // .where('ExchangeRates.rate = :rate', { rate: statusFilter })
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(sortBy, order)
            .getMany();

        total = await this.db
            .createQueryBuilder('WalletTypes')
            // .where('ExchangeRates.status = :status', { status: statusFilter })
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

    async one(id): Promise<WalletTypes[]> {
        const one = await this.db
            .createQueryBuilder('WalletTypes')
            .where('walletTypeId = :walletTypeId', { walletTypeId: id })
            .orderBy('createdAt', 'DESC')
            .getMany();
        try {
            return one;
        } catch (error) {
            throw new Error(error);
        }
    }

    async add(body): Promise<WalletTypes> {
        const { name, symbol, code, rate } = body;
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

        await this.db
            .createQueryBuilder('WalletTypes')
            .insert()
            .into(WalletTypes)
            .values({ name, symbol, code, rate, createdAt })
            .execute();

        const wasCreated = await this.db
            .createQueryBuilder('WalletTypes')
            .orderBy('createdAt', 'DESC')
            .getOne();
        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }

    async update(id, body): Promise<WalletTypes[]> {
        const { name, symbol, code, rate } = body;
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        await this.db
            .createQueryBuilder('WalletTypes')
            .update(WalletTypes)
            .set({ name, symbol, code, rate, updatedAt })
            .where('walletTypeId = :walletTypeId', { walletTypeId: id })
            .execute();
        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }

    async remove(id) {
        await this.db
            .createQueryBuilder('WalletTypes')
            .delete()
            .where('walletTypeId = :walletTypeId', { walletTypeId: id })
            .execute();
        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }
}
