import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToOne, JoinColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { Users } from "./Users";
import { TwoFAProveAuth } from "./enums";

@Entity()
export class TwoFactorAuthenticator {
    @PrimaryGeneratedColumn("uuid")
    twoFactorAuthenticatorId: string;

    @OneToOne(() => Users, Users => Users.twoFactorAuthenticatorId)
    @JoinColumn({ name: 'userId' })
    userId: Users;

    @Column({ nullable: true, type: 'enum', enum: TwoFAProveAuth })
    proveAuth: TwoFAProveAuth;

    @Column({ nullable: true })
    verified: number;

    @Column({ nullable: true, length: 100, select: false })
    secret: string;

    @Column({ nullable: true, length: 100 })
    qrCode: string;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @Column({ nullable: true, length: 36 })
    createdBy: string;

    @BeforeInsert()
    generateId() {
        this.twoFactorAuthenticatorId = uuidv4();
    }
}
