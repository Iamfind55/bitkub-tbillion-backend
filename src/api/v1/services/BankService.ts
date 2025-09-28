import { AppDataSource } from "../../../config/DataSource";
import { Banks } from "../entities/Banks";
import moment from "moment";

export class BankService {
    private db = AppDataSource.getRepository(Banks);

    async all(pageSize, page, sortBy, order, startDate, endDate, search) {
        let keysToSearch = ['name', 'accountName', 'accountNumber'];

        const queryBuilder = this.db
            .createQueryBuilder('bank')
            .leftJoinAndSelect('bank.user', 'user');

        if (startDate && endDate) {
            queryBuilder.where('bank.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`bank.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }

        const all = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`bank.${sortBy}`, order)
            .getMany();

        const total = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`bank.${sortBy}`, order)
            .getCount();
        try {
            return { all, total };
        } catch (error) {
            throw new Error(error);
        }
    }


    async owner(id): Promise<Banks[]> {
        const owner = await this.db
            .createQueryBuilder('bank')
            // .leftJoinAndSelect('bank.user', 'user')
            .where({ user: id })
            .getMany();
        try {
            return owner;
        } catch (error) {
            throw new Error(error);
        }
    }


    async one(id): Promise<Banks[]> {
        const one = await this.db
            .createQueryBuilder('Banks')
            .where('bankId = :bankId', { bankId: id })
            .getMany();
        try {
            return one;
        } catch (error) {
            throw new Error(error);
        }
    }

    async add(userId, body): Promise<Banks> {
        const { name, accountName, accountNumber } = body;
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        await this.db
            .createQueryBuilder('Banks')
            .insert()
            .into(Banks)
            .values({ user: userId, name, accountName, accountNumber, createdAt })
            .execute();

        const wasCreated = await this.db
            .createQueryBuilder('Banks')
            .orderBy('createdAt', 'DESC')
            .getOne();
        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }

    async update(id, body): Promise<Banks[]> {
        const { name, accountName, accountNumber } = body;
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

        await this.db
            .createQueryBuilder('Banks')
            .update(Banks)
            .set({ name, accountName, accountNumber, updatedAt })
            .where('bankId = :bankId', { bankId: id })
            .execute();
        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }

    async remove(id) {
        await this.db
            .createQueryBuilder('Banks')
            .delete()
            .where('bankId = :bankId', { bankId: id })
            .execute();
        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }
}
