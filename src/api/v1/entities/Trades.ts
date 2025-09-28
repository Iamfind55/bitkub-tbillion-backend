import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { TradeType, TradeStatus, TradeUpDown } from './enums';
import { v4 as uuidv4 } from 'uuid';
import { Wallets } from "./Wallets";
import { Durations } from "./Durations";
import { Transactions } from "./Transactions";

@Entity()
export class Trades {
    @PrimaryGeneratedColumn("uuid")
    tradeId: string;

    @ManyToOne(() => Wallets, wallet => wallet.trade)
    @JoinColumn({ name: 'walletId' })
    wallet: Wallets;

    @ManyToOne(() => Durations, duration => duration.trade)
    @JoinColumn({ name: 'durationId' })
    duration: Durations;

    @OneToOne(() => Transactions, transaction => transaction.trade)
    transaction: Transactions[];

    @Column({ nullable: true, length: 36 })
    userId: string;

    @Column({ nullable: true, length: 30 })
    type: string;

    @Column({ nullable: true, type: 'enum', enum: TradeUpDown })
    trade: TradeUpDown;

    @Column({ nullable: true })
    percent: number;

    @Column({ nullable: true, type: "decimal", precision: 10, scale: 2, default: 0.00 })
    quantity: number;

    @Column({ nullable: true, type: "decimal", precision: 10, scale: 2, default: 0.00 })
    price: number;

    @Column({ nullable: true })
    number: number;

    @Column({ nullable: true })
    unit: string;

    @Column({ nullable: true, type: "datetime" })
    startDate: Date;

    @Column({ nullable: true, type: "datetime" })
    endDate: Date;

    @Column({ nullable: true, type: 'enum', enum: TradeStatus })
    status: TradeStatus;

    @Column({ nullable: true, type: 'boolean', default: false })
    isTransfer: boolean;

    @Column({ nullable: true, type: 'boolean', default: true })
    isTrade: boolean;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @Column({ nullable: true, length: 36 })
    createdBy: string;

    @BeforeInsert()
    generateId() {
        this.tradeId = uuidv4();
    }
}
