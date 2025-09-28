import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { Wallets } from "./Wallets";

@Entity()
export class WalletTypes {
    @PrimaryGeneratedColumn("uuid")
    walletTypeId: string;

    @OneToMany(() => Wallets, type => type.type)
    wallet: Wallets[];

    @Column({ nullable: true, length: 50, unique: true })
    name: string;

    @Column({ nullable: true, length: 20, unique: true })
    symbol: string;

    @Column({ nullable: true, length: 50, unique: true })
    code: string;

    @Column({ nullable: true, type: "decimal", precision: 10, scale: 2, default: 0.00 })
    rate: number;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @BeforeInsert()
    generateId() {
        this.walletTypeId = uuidv4();
    }
}
