import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToOne, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { Users } from "./Users";
import { AccountType } from "./enums";
import { Transactions } from "./Transactions";
import { Trades } from "./Trades";
import { WalletTypes } from "./WalletTypes";
import { Withdraws } from "./Withdraws";
import { Coins } from "./Coins";

@Entity()
export class Wallets {
    @PrimaryGeneratedColumn("uuid")
    walletId: string;

    @ManyToOne(() => Users, user => user.wallet)
    @JoinColumn({ name: 'userId' })
    user: Users;

    @ManyToOne(() => WalletTypes, type => type.wallet)
    @JoinColumn({ name: 'walletTypeId' })
    type: WalletTypes;

    @OneToMany(() => Transactions, transaction => transaction.wallet)
    transaction: Transactions[];

    @OneToMany(() => Withdraws, withdraw => withdraw.wallet)
    withdraw: Withdraws[];

    @OneToMany(() => Trades, trade => trade.wallet)
    trade: Trades[];

    @OneToMany(() => Coins, coin => coin.wallet)
    coin: Coins[];

    @Column({ nullable: true, type: "decimal", precision: 10, scale: 2, default: 0.00 })
    balance: number;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @Column({ nullable: true, length: 36 })
    createdBy: string;

    @BeforeInsert()
    generateId() {
        this.walletId = uuidv4();
    }
}
