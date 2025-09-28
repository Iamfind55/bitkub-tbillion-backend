import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { AssetType, PaymentMethod, TransactionStatus, TransactionType } from './enums';
import { v4 as uuidv4 } from 'uuid';
import { Wallets } from "./Wallets";
import { Banks } from "./Banks";
import { Trades } from "./Trades";
import { Users } from "./Users";
import { Withdraws } from "./Withdraws";
import { Coins } from "./Coins";

@Entity()
export class Transactions {
    @PrimaryGeneratedColumn("uuid")
    transactionId: string;

    @ManyToOne(() => Wallets, wallet => wallet.transaction)
    @JoinColumn({ name: 'walletId' })
    wallet: Wallets;

    @ManyToOne(() => Banks, bank => bank.transaction)
    @JoinColumn({ name: 'bankId' })
    bank: Banks;

    @OneToOne(() => Trades, trade => trade.transaction)
    @JoinColumn({ name: 'tradeId' })
    trade: Trades;

    @OneToOne(() => Withdraws, withdraw => withdraw.transaction)
    @JoinColumn({ name: 'withdrawId' })
    withdraw: Withdraws;

    @OneToOne(() => Coins, coin => coin.transaction)
    @JoinColumn({ name: 'coinId' })
    coin: Coins;

    @Column({ nullable: true, length: 36 })
    userId: string;


    @Column({ nullable: true, length: 36 })
    baseWalletId: string;

    @Column({ nullable: true, length: 36 })
    targetWalletId: string;

    // @ManyToOne(() => Currencies, currency => currency.transaction)
    // @JoinColumn({ name: 'currencyCode' })
    // currency: Currencies;

    // @OneToOne(() => Wallets, wallet => wallet.baseWallet)
    // @JoinColumn({ name: 'baseWalletId' })
    // baseWallet: Wallets;

    // @OneToOne(() => Wallets, wallet => wallet.targetWallet)
    // @JoinColumn({ name: 'targetWalletId' })
    // targetWallet: Wallets;

    @Column({ nullable: true, type: 'enum', enum: TransactionType })
    type: TransactionType;

    @Column({ nullable: true, type: 'enum', enum: PaymentMethod })
    method: PaymentMethod;

    @Column({ nullable: true, type: "decimal", precision: 10, scale: 2, default: 0.00 })
    amount: number;

    @Column({ nullable: true, type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
    status: TransactionStatus;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @Column({ nullable: true, length: 36 })
    createdBy: string;

    @BeforeInsert()
    generateId() {
        this.transactionId = uuidv4();
    }
}
