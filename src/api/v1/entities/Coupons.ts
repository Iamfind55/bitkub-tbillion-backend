import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, JoinColumn } from "typeorm";
import { CouponStatus } from './enums';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Coupons {
    @PrimaryGeneratedColumn("uuid")
    couponId: string;

    @Column({ nullable: true })
    percent: number;

    @Column({ nullable: true, type: "date" })
    startDate: Date;

    @Column({ nullable: true, type: "date" })
    endDate: Date;

    @Column({ nullable: true, type: 'enum', enum: CouponStatus, default: CouponStatus.OPENING })
    status: CouponStatus;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @BeforeInsert()
    generateId() {
        this.couponId = uuidv4();
    }
}
