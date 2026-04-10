import bcrypt from "bcryptjs";
import { getDataSource } from "@/server/db/data-source";
import { userRepo } from "@/server/db/repositories";
import { User } from "../entities/User";
import { seedDefaultCategoriesForUser } from "@/server/services/categories";

const SALT_ROUNDS = 10;

export async function findUserByEmail(email: string): Promise<User | null> {
  const ds = await getDataSource();
  const repo = userRepo(ds);
  return repo.findOne({ where: { email: email.trim().toLowerCase() } });
}

export async function createUser(input: {
  email: string;
  password: string;
  displayName?: string | null;
}): Promise<User> {
  const ds = await getDataSource();
  const repo = userRepo(ds);
  const email = input.email.trim().toLowerCase();
  const exists = await repo.exist({ where: { email } });
  if (exists) {
    throw new Error("Bu email allaqachon ro‘yxatdan o‘tgan");
  }
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const u = repo.create({
    email,
    passwordHash,
    displayName: input.displayName?.trim() || null,
    isAdmin: false,
  });
  const saved = await repo.save(u);
  await seedDefaultCategoriesForUser(saved.id);
  return saved;
}

export async function verifyUserPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}
