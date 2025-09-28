import { AppDataSource } from "../../../config/DataSource";
import { Wallets } from "../entities/Wallets";
import moment from "moment";
import { WalletTypes } from "../entities/WalletTypes";

export class UserService {
    private db = AppDataSource.getRepository(Wallets);
    private walletTypeRepository = AppDataSource.getRepository(WalletTypes);

    async all(pageSize, page, sortBy, order, search) {

        const all = await this.db
            .createQueryBuilder('wallet')
            .leftJoinAndSelect('wallet.type', 'type')
            .leftJoinAndSelect('wallet.user', 'user')
            // .where('user.name LIKE :name', { name: `%${search}%` })
            // .orWhere('user.email LIKE :email', { email: `%${search}%` })
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy(`wallet.${sortBy}`, order)
            .getMany();

        const total = await this.db
            .createQueryBuilder('wallet')
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

    async one(id): Promise<Wallets[]> {
        const one = await this.db
            .createQueryBuilder('wallet')
            .leftJoinAndSelect('wallet.type', 'type')
            .leftJoinAndSelect('wallet.user', 'user')
            .where('wallet.walletId = :walletId', { walletId: id })
            .orderBy('wallet.createdAt', 'DESC')
            .getMany();
        try {
            return one;
        } catch (error) {
            throw new Error(error);
        }
    }

    async wallet(walletId): Promise<Wallets[]> {
        const wallet = await this.db
            .createQueryBuilder('wallet')
            .leftJoinAndSelect('wallet.type', 'type')
            .where('walletId = :walletId', { walletId })
            .getMany();
        try {
            return wallet;
        } catch (error) {
            throw new Error(error);
        }
    }

    async owner(id): Promise<Wallets[]> {
        const wallet = await this.db
            .createQueryBuilder('wallet')
            .leftJoinAndSelect('wallet.type', 'type')
            .where('wallet.user = :id', { id })
            .andWhere('type.name != :name', { name:"usd" })
            .getMany();

        try {
            return wallet;
        } catch (error) {
            throw new Error(error);
        }
    }

    async add(createdBy, body): Promise<Wallets> {
        const { user, type, balance } = body;
        const createdAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

        const totalBalance = 0;
        await this.db
            .createQueryBuilder('Wallets')
            .insert()
            .into(Wallets)
            .values({ user, type, createdAt, createdBy })
            .execute();

        const wasCreated = await this.db
            .createQueryBuilder('Wallets')
            .orderBy('createdAt', 'DESC')
            .getOne();
        try {
            return wasCreated;
        } catch (error) {
            throw new Error(error);
        }
    }

    async update(id, body): Promise<Wallets[]> {
        const { type } = body;
        const updatedAt = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));


        //Type
        const result = await this.db
            .createQueryBuilder('Wallets')
            .where({ walletId: id })
            .getOne();
        const walletTypeId = result.type.walletTypeId;
        const balance = result.balance;

        const walletType = await this.walletTypeRepository
            .createQueryBuilder('WalletTypes')
            .where({ walletTypeId: walletTypeId })
            .getOne();
        const rate = walletType.rate;


        //Update wallet
        await this.db
            .createQueryBuilder('Wallets')
            .update(Wallets)
            .set({ type, balance: rate * balance, updatedAt })
            .where('walletId = :walletId', { walletId: id })
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
