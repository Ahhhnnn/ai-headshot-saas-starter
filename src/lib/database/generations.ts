import { db } from "@/database";
import { generations } from "@/database/tables";
import { eq, desc, count } from "drizzle-orm";

/**
 * 获取用户的生成记录
 * @param userId - 用户ID
 * @param limit - 返回记录数量限制
 * @param offset - 偏移量
 * @returns 用户的生成记录列表，按创建时间降序排列
 */
export async function getUserGenerations(
  userId: string,
  limit: number = 20,
  offset: number = 0,
) {
  return await db
    .select()
    .from(generations)
    .where(eq(generations.userId, userId))
    .orderBy(desc(generations.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * 统计用户总生成数量
 * @param userId - 用户ID
 * @returns 用户的生成记录总数
 */
export async function getGenerationCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(generations)
    .where(eq(generations.userId, userId));
  return result[0]?.count ?? 0;
}
