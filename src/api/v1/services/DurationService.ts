import { AppDataSource } from "../../../config/DataSource";
import { Durations } from "../entities/Durations";
import moment from "moment";

export class DurationService {
    private db = AppDataSource.getRepository(Durations);

    async all(pageSize, page, sortBy, order) {
        const all = await this.db
            .createQueryBuilder('Durations')
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(sortBy, order)
            .getMany();

        const total = await this.db
            .createQueryBuilder('Durations')
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

    async one(id): Promise<Durations[]> {
        const one = await this.db
            .createQueryBuilder('Durations')
            .where('durationId = :durationId', { durationId: id })
            .orderBy('createdAt', 'DESC')
            .getMany();
        try {
            return one;
        } catch (error) {
            throw new Error(error);
        }
    }

    async add(createdBy, body): Promise<Durations> {
        const { number, unit, percent, minPrice } = body;
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

        await this.db
            .createQueryBuilder('Durations')
            .insert()
            .into(Durations)
            .values({ number, unit, percent, minPrice, createdAt, createdBy })
            .execute();

        const wasCreated = await this.db
            .createQueryBuilder('Durations')
            .orderBy('createdAt', 'DESC')
            .getOne();
        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }

    async update(id, body, createdBy): Promise<Durations[]> {
        const { number, unit, percent, minPrice } = body;
        console.log({ number, unit, percent, minPrice });

        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        await this.db
            .createQueryBuilder('Durations')
            .update(Durations)
            .set({ number, unit, percent, minPrice, updatedAt, createdBy })
            .where('durationId = :durationId', { durationId: id })
            .execute();
        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }

    async remove(id) {
        await this.db
            .createQueryBuilder('Durations')
            .delete()
            .where('durationId = :durationId', { durationId: id })
            .execute();
        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }
}
