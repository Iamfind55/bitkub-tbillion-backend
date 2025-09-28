import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToOne, JoinColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { Users } from "./Users";

@Entity()
export class IdentityCard {
    @PrimaryGeneratedColumn("uuid")
    identityCardId: string;

    // @OneToOne(() => Users, Users => Users.identityCardId)
    // @JoinColumn({ name: 'userId' })
    // userId: Users;

    @Column({ nullable: true, type: "bigint", select: false })
    cardNumber: number;

    @Column({ nullable: true, type: "date" })
    issueDate: Date;

    @Column({ nullable: true, type: "date" })
    expiryDate: Date;

    @Column({ nullable: true, length: 100 })
    cardFront: string;

    @Column({ nullable: true, length: 100 })
    cardBack: string;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @BeforeInsert()
    generateId() {
        this.identityCardId = uuidv4();
    }
}
