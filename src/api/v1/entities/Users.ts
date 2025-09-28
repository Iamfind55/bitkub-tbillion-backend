import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany, OneToOne } from "typeorm";
import { UserStatus, UserRole, UserGender, AccountType, UserProveAuth } from './enums';
import { v4 as uuidv4 } from 'uuid';
import { Wallets } from "./Wallets";
import { TwoFactorAuthenticator } from "./TwoFactorAuthenticator";
import { Banks } from "./Banks";
import { Profiles } from "./Profiles";
import { Coins } from "./Coins";

@Entity()
export class Users {
  @PrimaryGeneratedColumn("uuid")
  userId: string;

  @OneToOne(() => TwoFactorAuthenticator, TwoFactorAuthenticator => TwoFactorAuthenticator.userId)
  twoFactorAuthenticatorId: TwoFactorAuthenticator[];

  @OneToMany(() => Wallets, wallet => wallet.user)
  wallet: Wallets[];

  @OneToMany(() => Banks, bank => bank.user)
  bank: Banks[];

  @OneToMany(() => Profiles, profile => profile.user)
  profile: Profiles[];

  @OneToMany(() => Coins, coin => coin.user)
  coin: Coins[];

  @Column({ nullable: true, length: 50 })
  accountId: string;

  @Column({ nullable: true, length: 50 })
  name: string;

  @Column({ nullable: true, type: 'enum', enum: UserGender })
  gender: UserStatus;

  @Column({ nullable: true, type: "date" })
  dob: Date;

  @Column({ nullable: true, length: 30 })
  phone: string;

  @Column({ nullable: true, length: 30 })
  email: string;

  @Column({ nullable: true, type: "text", select: true })
  password: string;

  @Column({ nullable: true, type: "text" })
  address: string;

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

  @Column({ nullable: true, type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ nullable: true, type: 'text', select: false })
  otp: string;

  @Column({ nullable: true, type: 'enum', enum: UserProveAuth })
  proveAuth: UserProveAuth;

  @Column({ nullable: true, type: 'enum', enum: UserStatus, default: UserStatus.INACTIVE })
  status: UserStatus;

  @Column({ nullable: true, type: 'datetime' })
  createdAt: Date;

  @Column({ nullable: true, type: 'datetime' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'datetime' })
  verifiedAt: Date;

  @Column({ nullable: true, type: 'datetime' })
  provedAt: Date;

  @Column({ nullable: true, length: 36 })
  createdBy: string;

  @BeforeInsert()
  generateId() {
    this.userId = uuidv4();
  }
}
