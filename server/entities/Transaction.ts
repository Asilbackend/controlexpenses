import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import  { User } from "./User";
import  { Category } from "./Category";

export type TransactionType = "expense" | "income";
export type TransactionSource = "manual" | "voice";

@Entity({ name: "transactions" })
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Index()
  @Column({ type: "uuid" })
  categoryId!: string;

  @ManyToOne(() => Category, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "categoryId" })
  category!: Category;

  @Index()
  @Column({ type: "varchar", length: 16 })
  type!: TransactionType;

  // so'mda (butun son)
  @Column({ type: "integer" })
  amount!: number;

  @Column({ type: "varchar", length: 2000, nullable: true })
  description!: string | null;

  @Index()
  @Column({ type: "timestamptz" })
  occurredAt!: Date;

  @Column({ type: "varchar", length: 16 })
  source!: TransactionSource;

  @Column({ type: "text", nullable: true })
  transcript!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
