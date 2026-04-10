import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import  { User } from "./User";

export type CategoryType = "expense" | "income";

@Entity({ name: "categories" })
@Index(["userId", "name", "type"], { unique: true })
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Index()
  @Column({ type: "varchar", length: 16 })
  type!: CategoryType;

  @Column({ type: "varchar", length: 16, default: "#6366f1" })
  color!: string;

  @Column({ type: "varchar", length: 32, default: "📁" })
  icon!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  /** Ovozli matn bilan moslashtirish uchun qo‘shimcha kalit so‘zlar */
  @Column({ type: "jsonb", default: [] })
  keywords!: string[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
