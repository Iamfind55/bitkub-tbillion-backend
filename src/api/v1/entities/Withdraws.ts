import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { WithdrawStatus } from './enums';
import { v4 as uuidv4 } from 'uuid';
import { Wallets } from "./Wallets";
import { Transactions } from "./Transactions";

@Entity()
export class Withdraws {
    @PrimaryGeneratedColumn("uuid")
    withdrawId: string;

    @ManyToOne(() => Wallets, wallet => wallet.withdraw)
    @JoinColumn({ name: 'walletId' })
    wallet: Wallets;

    @OneToOne(() => Transactions, transaction => transaction.withdraw)
    transaction: Transactions[];

    @Column({ nullable: true, length: 36 })
    userId: string;

    @Column({ nullable: true, length: 50 })
    name: String;

    @Column({ nullable: true, length: 50 })
    accountName: String;

    @Column({ nullable: true, length: 50 })
    accountNumber: String;

    @Column({ nullable: true, type: "decimal", precision: 10, scale: 2, default: 0.00 })
    amount: number;

    @Column({ nullable: true, type: 'enum', enum: WithdrawStatus })
    status: WithdrawStatus;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @Column({ nullable: true, length: 36 })
    createdBy: string;

    @BeforeInsert()
    generateId() {
        this.withdrawId = uuidv4();
    }
}
