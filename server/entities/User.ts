import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 320 })
  email!: string;

  @Column({ type: "varchar" })
  passwordHash!: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  displayName!: string | null;

  @Column({ type: "boolean", default: false })
  isAdmin!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
