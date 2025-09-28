import { create } from "domain";
import { AppDataSource } from "../../../config/DataSource";
import { Profiles } from "../entities/Profiles";
import { unlink } from 'fs';
import moment from "moment";

export class ProfileService {
    private profileRepository = AppDataSource.getRepository(Profiles);

    async all(pageSize, page, sortBy, order) {
        const all = await this.profileRepository
            .createQueryBuilder('Profiles')
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(sortBy, order)
            .getMany();

        const total = await this.profileRepository
            .createQueryBuilder('Profiles')
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

    async one(id): Promise<Profiles[]> {
        const one = await this.profileRepository
            .createQueryBuilder('Profiles')
            .where('profileId = :profileId', { profileId: id })
            .orderBy('createdAt', 'DESC')
            .getMany();
        try {
            return one;
        } catch (error) {
            throw new Error(error);
        }
    }

    async add(userId, images): Promise<Profiles> {
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

        for (const image of images) {
            const { filename, originalname, encoding, mimetype, destination, size, path } = image;

            await this.profileRepository
                .createQueryBuilder("Profiles")
                .insert()
                .into("Profiles")
                .values({ user: userId, filename, originalname, encoding, mimetype, destination, size, path, createdAt, createdBy: userId })
                .execute();
        }

        const wasCreated = await this.profileRepository
            .createQueryBuilder('Profiles')
            .orderBy('createdAt', 'DESC')
            .getOne();
        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }

    async update(id, images): Promise<Profiles[]> {
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

        for (const image of images) {
            const { filename, originalname, encoding, mimetype, destination, size, path } = image;
            await this.profileRepository
                .createQueryBuilder('Profiles')
                .update(Profiles)
                .set({ filename, originalname, encoding, mimetype, destination, size, path, updatedAt })
                .where('profileId = :profileId', { profileId: id })
                .execute();
        }

        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }

    async remove(id) {
        await this.profileRepository
            .createQueryBuilder('Profiles')
            .delete()
            .where('profileId = :profileId', { profileId: id })
            .execute();
        try {
            return await this.one(id);
        } catch (error) {
            throw new Error(error);
        }
    }
}
