import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { Users } from "./Users";
import { Transactions } from "./Transactions";

@Entity()
export class Banks {
    @PrimaryGeneratedColumn("uuid")
    bankId: string;

    @ManyToOne(() => Users, user => user.bank)
    @JoinColumn({ name: 'userId' })
    user: Users;

    @OneToMany(() => Transactions, transaction => transaction.bank)
    transaction: Transactions[];

    @Column({ nullable: true, length: 30 })
    name: string;

    @Column({ nullable: true, length: 50 })
    accountName: string;

    @Column({ nullable: true, length: 50, select: true })
    accountNumber: string;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @Column({ nullable: true, length: 36 })
    createdBy: string;

    @BeforeInsert()
    generateId() {
        this.bankId = uuidv4();
    }
}
