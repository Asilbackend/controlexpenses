import { getDataSource } from "@/server/db/data-source";
import { categoryRepo, transactionRepo } from "@/server/db/repositories";
import { Category, type CategoryType } from "@/server/entities/Category";
import { DEFAULT_CATEGORY_SEEDS } from "@/server/services/default-categories";

export async function seedDefaultCategoriesForUser(userId: string): Promise<void> {
  const ds = await getDataSource();
  const repo = categoryRepo(ds);
  const rows = DEFAULT_CATEGORY_SEEDS.map((s) =>
    repo.create({
      userId,
      name: s.name,
      type: s.type,
      color: s.color,
      icon: s.icon,
      isActive: true,
      keywords: mergeKeywords(s.name, s.keywords),
    })
  );
  await repo.save(rows);
}

function mergeKeywords(name: string, extra: string[]): string[] {
  const base = [name, ...name.split(/[\s/]+/).filter(Boolean)];
  const set = new Set<string>();
  for (const x of [...base, ...extra]) {
    const t = x.trim().toLowerCase();
    if (t) set.add(t);
  }
  return Array.from(set);
}

export async function listCategoriesForUser(
  userId: string,
  opts?: { type?: CategoryType; includeInactive?: boolean }
): Promise<Category[]> {
  const ds = await getDataSource();
  const repo = categoryRepo(ds);
  const qb = repo
    .createQueryBuilder("c")
    .where("c.userId = :userId", { userId })
    .orderBy("c.type", "ASC")
    .addOrderBy("c.name", "ASC");
  if (opts?.type) qb.andWhere("c.type = :type", { type: opts.type });
  if (!opts?.includeInactive) qb.andWhere("c.isActive = true");
  return qb.getMany();
}

export async function getCategoryForUser(userId: string, id: string): Promise<Category | null> {
  const ds = await getDataSource();
  const repo = categoryRepo(ds);
  return repo.findOne({ where: { id, userId } });
}

export async function createCategory(input: {
  userId: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  keywords?: string[];
  isActive?: boolean;
}): Promise<Category> {
  const ds = await getDataSource();
  const repo = categoryRepo(ds);
  const name = input.name.trim();
  if (!name) throw new Error("Kategoriya nomi bo‘sh bo‘lmasligi kerak");

  const dup = await repo.exist({
    where: { userId: input.userId, name, type: input.type },
  });
  if (dup) throw new Error("Bu nom va tur bilan kategoriya allaqachon mavjud");

  const c = repo.create({
    userId: input.userId,
    name,
    type: input.type,
    color: input.color?.trim() || "#6366f1",
    icon: input.icon?.trim() || "📁",
    isActive: input.isActive ?? true,
    keywords: mergeKeywords(name, input.keywords ?? []),
  });
  return repo.save(c);
}

export async function updateCategory(
  userId: string,
  id: string,
  patch: Partial<{
    name: string;
    type: CategoryType;
    color: string;
    icon: string;
    isActive: boolean;
    keywords: string[];
  }>
): Promise<Category> {
  const c = await getCategoryForUser(userId, id);
  if (!c) throw new Error("Kategoriya topilmadi");

  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) throw new Error("Kategoriya nomi bo‘sh bo‘lmasligi kerak");
    const ds = await getDataSource();
    const repo = categoryRepo(ds);
    const type = patch.type ?? c.type;
    const other = await repo.findOne({ where: { userId, name, type } });
    if (other && other.id !== id) throw new Error("Bu nom va tur bilan kategoriya allaqachon mavjud");
    c.name = name;
  }
  if (patch.type !== undefined) c.type = patch.type;
  if (patch.color !== undefined) c.color = patch.color.trim();
  if (patch.icon !== undefined) c.icon = patch.icon.trim();
  if (patch.isActive !== undefined) c.isActive = patch.isActive;
  if (patch.keywords !== undefined) {
    c.keywords = mergeKeywords(c.name, patch.keywords);
  } else if (patch.name !== undefined) {
    c.keywords = mergeKeywords(c.name, c.keywords);
  }

  const ds = await getDataSource();
  return categoryRepo(ds).save(c);
}

export async function deleteCategory(userId: string, id: string): Promise<void> {
  const ds = await getDataSource();
  const repo = categoryRepo(ds);
  const c = await getCategoryForUser(userId, id);
  if (!c) throw new Error("Kategoriya topilmadi");
  const txCount = await transactionRepo(ds).count({ where: { categoryId: id, userId } });
  if (txCount > 0) {
    throw new Error("Bu kategoriyada tranzaksiyalar bor — avval ularni boshqa kategoriyaga o‘zgartiring yoki o‘chiring");
  }
  await repo.delete({ id, userId });
}

