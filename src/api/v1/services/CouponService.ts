import { start } from "repl";
import { AppDataSource } from "../../../config/DataSource";
import { Coupons } from "../entities/Coupons";
import moment from "moment";

export class CouponService {
    private db = AppDataSource.getRepository(Coupons);
    async all(pageSize, page, sortBy, order, startDate, endDate, statusFilter, search) {
        let keysToSearch = ['percent', 'status'];

        const queryBuilder = this.db
            .createQueryBuilder('Coupons');

        if (startDate && endDate) {
            queryBuilder.where('Coupons.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        if (statusFilter) {
            queryBuilder.where('Coupons.status = :status', { status: statusFilter });
        }

        if (search) {
            keysToSearch.forEach((key) => {
                queryBuilder.orWhere(`Coupons.${key} LIKE :searchTerm`, { searchTerm: `%${search}%` });
            });
        }

        const all = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`Coupons.${sortBy}`, order)
            .getMany();

        const total = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`Coupons.${sortBy}`, order)
            .getCount();
        try {
            return { all, total };
        } catch (error) {
            throw new Error(error);
        }
    }


    async promotion() {
        const queryBuilder = this.db
            .createQueryBuilder('Coupons');

        const all = await queryBuilder
            .take(1)
            .orderBy('createdAt', "DESC")
            .getOne();

        const total = await queryBuilder
            .take(1)
            .orderBy('createdAt', "DESC")
            .getCount();
        try {
            return { all, total };
        } catch (error) {
            throw new Error(error);
        }
    }


    async one(id): Promise<Coupons[]> {
        const one = await this.db
            .createQueryBuilder('Coupons')
            .where('couponId = :couponId', { couponId: id })
            .orderBy('createdAt', 'DESC')
            .getMany();
        try {
            return one;
        } catch (error) {
            throw new Error(error);
        }
    }

    async add(body): Promise<Coupons> {
        const { percent, startDate, endDate, status } = body;
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        await this.db
            .createQueryBuilder('Coupons')
            .insert()
            .into(Coupons)
            .values({ percent, startDate, endDate, status, createdAt })
            .execute();

        const wasCreated = await this.db
            .createQueryBuilder('Coupons')
            .orderBy('createdAt', 'DESC')
            .getOne();
        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }

    async update(id, body): Promise<Coupons[]> {
        const { percent, startDate, endDate, status } = body;
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        await this.db
            .createQueryBuilder('Coupons')
            .update(Coupons)
            .set({ percent, startDate, endDate, status, updatedAt })
            .where('couponId = :couponId', { couponId: id })
            .execute();
        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }

    async remove(id) {
        await this.db
            .createQueryBuilder('Coupons')
            .delete()
            .where('couponId = :couponId', { couponId: id })
            .execute();
        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }
}
