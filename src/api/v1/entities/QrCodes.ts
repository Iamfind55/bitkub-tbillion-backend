import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";
import { Statuses } from './enums';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class QrCodes {
    @PrimaryGeneratedColumn("uuid")
    qrId: string;

    @Column({ nullable: true, length: 50 })
    name: String;

    @Column({ nullable: true, length: 50 })
    accountNumber: string;

    @Column({ nullable: true, type: 'longtext' })
    qr: String;

    @Column({ nullable: true, type: 'text' })
    path: string;

    @Column({ nullable: true, type: 'enum', enum: Statuses })
    status: Statuses;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @Column({ nullable: true, length: 36 })
    createdBy: string;

    @BeforeInsert()
    generateId() {
        this.qrId = uuidv4();
    }
}
