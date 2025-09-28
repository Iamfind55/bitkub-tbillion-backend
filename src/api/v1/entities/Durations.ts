import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany, JoinColumn } from "typeorm";
import { DurationUnit } from './enums';
import { v4 as uuidv4 } from 'uuid';
import { Trades } from "./Trades";

@Entity()
export class Durations {
    @PrimaryGeneratedColumn("uuid")
    durationId: string;

    @OneToMany(() => Trades, transaction => transaction.duration)
    trade: Trades[];

    @Column({ nullable: true })
    number: number;

    @Column({ nullable: true, type: 'enum', enum: DurationUnit, default: DurationUnit.SECOND })
    unit: DurationUnit;

    @Column({ nullable: true })
    percent: number;

    @Column({ nullable: true, type: "decimal", precision: 10, scale: 2, default: 0.00 })
    minPrice: number;

    @Column({ nullable: true, type: "decimal", precision: 10, scale: 2, default: 0.00 })
    maxPrice: number;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @Column({ nullable: true, length: 36 })
    createdBy: string;

    @BeforeInsert()
    generateId() {
        this.durationId = uuidv4();
    }
}
