import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, JoinColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { Users } from "./Users";

@Entity()
export class Profiles {
    @PrimaryGeneratedColumn("uuid")
    profileId: string;

    @ManyToOne(() => Users, user => user.profile)
    @JoinColumn({ name: 'userId' })
    user: Users;

    @Column({ nullable: true, length: 100 })
    filename: string;

    @Column({ nullable: true, type: 'text' })
    originalname: string;

    @Column({ nullable: true, type: 'text' })
    path: string;

    @Column({ nullable: true, length: 50 })
    size: string;

    @Column({ nullable: true, length: 50 })
    encoding: string;

    @Column({ nullable: true, length: 50 })
    destination: string;

    @Column({ nullable: true, length: 50 })
    mimetype: string;

    @Column({ nullable: true, type: 'datetime' })
    createdAt: Date;

    @Column({ nullable: true, type: 'datetime' })
    updatedAt: Date;

    @Column({ nullable: true, length: 36 })
    createdBy: string;

    @BeforeInsert()
    generateId() {
        this.profileId = uuidv4();
    }
}
