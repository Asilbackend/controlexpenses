import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "voice_logs" })
export class VoiceLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "text" })
  transcript!: string;

  @Column({ type: "jsonb", nullable: true })
  parsed!: Record<string, unknown> | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  fileName!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
