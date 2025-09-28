import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { CoinStatus, CoinType } from './enums';
import { v4 as uuidv4 } from 'uuid';
import { Transactions } from "./Transactions";
import { Users } from "./Users";
import { Wallets } from "./Wallets";

@Entity()
export class Coins {
    @PrimaryGeneratedColumn("uuid")
    coinId: string;

    @ManyToOne(() => Users, user => user.coin)
    @JoinColumn({ name: 'userId' })
    user: Users;

    @ManyToOne(() => Wallets, wallet => wallet.coin)
    @JoinColumn({ name: 'walletId' })
    wallet: Wallets;

    @OneToOne(() => Transactions, transaction => transaction.coin)
    transaction: Transactions[];

    @Column({ nullable: true, length: 50 })
    name: String;

    @Column({ nullable: true, length: 50 })
    accountNumber: string;

    @Column({ nullable: true, type: "decimal", precision: 10, scale: 2, default: 0.00 })
    amount: number;

    @Column({ nullable: true, type: 'longtext' })
    image: String;

    @Column({ nullable: true, type: 'text' })
    path: string;

    @Column({ nullable: true, type: 'enum', enum: CoinType })
    type: CoinType;
    
    @Column({ nullable: true, type: 'enum', enum: CoinStatus })
    status: CoinStatus;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @Column({ nullable: true, length: 36 })
    createdBy: string;

    @BeforeInsert()
    generateId() {
        this.coinId = uuidv4();
    }
}
