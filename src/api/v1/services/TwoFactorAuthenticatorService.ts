import { start } from "repl";
import { AppDataSource } from "../../../config/DataSource";
import { TwoFactorAuthenticator } from "../entities/TwoFactorAuthenticator";
import moment from "moment";

export class TwoFactorAuthenticatorService {
    private db = AppDataSource.getRepository(TwoFactorAuthenticator);


    async enabled(body): Promise<TwoFactorAuthenticator> {
        const { percent, startDate, endDate, status } = body;
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        await this.db
            .createQueryBuilder('TwoFactorAuthenticator')
            .insert()
            .into(TwoFactorAuthenticator)
            // .values({ percent, startDate, endDate, status, createdAt })
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

    async verified(body): Promise<TwoFactorAuthenticator> {
        const { percent, startDate, endDate, status } = body;
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        await this.db
            .createQueryBuilder('TwoFactorAuthenticator')
            .insert()
            .into(TwoFactorAuthenticator)
            // .values({ percent, startDate, endDate, status, createdAt })
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

    async disabled(body): Promise<TwoFactorAuthenticator> {
        const { percent, startDate, endDate, status } = body;
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
        await this.db
            .createQueryBuilder('TwoFactorAuthenticator')
            .insert()
            .into(TwoFactorAuthenticator)
            // .values({ percent, startDate, endDate, status, createdAt })
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
}
