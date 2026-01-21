import { db } from "@/database";
import * as schema from "@/database/schema";
import { credits as creditsTable, creditTransactions as creditTransactionsTable } from "@/database/tables";
import { and, desc, eq, sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { ExtractTablesWithRelations } from "drizzle-orm";

export type Tx = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

const getDb = (tx?: Tx) => tx || db;

/**
 * Get user's credit balance
 */
export async function getUserCredits(userId: string, tx?: Tx) {
  const dbase = getDb(tx);
  const result = await dbase
    .select()
    .from(creditsTable)
    .where(eq(creditsTable.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Check if signup bonus has already been granted to a user
 * Checks for existing transaction with referenceId = "signup_{userId}"
 */
export async function hasSignupBonusBeenGranted(userId: string, tx?: Tx): Promise<boolean> {
  const dbase = getDb(tx);
  const result = await dbase
    .select()
    .from(creditTransactionsTable)
    .where(
      and(
        eq(creditTransactionsTable.userId, userId),
        eq(creditTransactionsTable.referenceId, `signup_${userId}`)
      )
    )
    .limit(1);
  return result.length > 0;
}

/**
 * Check if trialer package has been purchased by a user
 * Checks for existing transaction with description = "Credits from Trialer"
 */
export async function hasTrialerBeenPurchased(userId: string, tx?: Tx): Promise<boolean> {
  const dbase = getDb(tx);
  const result = await dbase
    .select()
    .from(creditTransactionsTable)
    .where(
      and(
        eq(creditTransactionsTable.userId, userId),
        eq(creditTransactionsTable.type, "payment_refill"),
        eq(creditTransactionsTable.description, "Credits from Trialer")
      )
    )
    .limit(1);
  return result.length > 0;
}

/**
 * Grant credits to a user (called after one-time payment)
 */
export async function grantCredits(
  userId: string,
  amount: number,
  referenceId: string,
  description: string,
  tx?: Tx,
) {
  const dbase = getDb(tx);
  const now = new Date();

  // Upsert credits balance
  await dbase
    .insert(creditsTable)
    .values({
      userId,
      balance: amount,
      totalEarned: amount,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: creditsTable.userId,
      set: {
        balance: sql`${creditsTable.balance} + ${amount}`,
        totalEarned: sql`${creditsTable.totalEarned} + ${amount}`,
        updatedAt: now,
      },
    });

  // Record transaction
  await dbase.insert(creditTransactionsTable).values({
    userId,
    amount,
    type: "payment_refill",
    referenceId,
    description,
  });
}

export class InsufficientCreditsError extends Error {
  constructor(
    userId: string,
    required: number,
    available: number,
  ) {
    super(
      `User ${userId} has insufficient credits. Required: ${required}, Available: ${available}`,
    );
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Deduct credits from a user (called when generating headshots)
 * @throws {InsufficientCreditsError} If user doesn't have enough credits
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  tx?: Tx,
) {
  if (amount <= 0) {
    throw new Error("Deduction amount must be positive");
  }

  const dbase = getDb(tx);
  const now = new Date();

  // Check current balance first (use transaction + select for update pattern)
  const creditRecord = await dbase
    .select()
    .from(creditsTable)
    .where(eq(creditsTable.userId, userId))
    .limit(1);

  const currentBalance = creditRecord[0]?.balance ?? 0;

  if (currentBalance < amount) {
    throw new InsufficientCreditsError(userId, amount, currentBalance);
  }

  // Update balance
  await dbase
    .update(creditsTable)
    .set({
      balance: sql`${creditsTable.balance} - ${amount}`,
      totalSpent: sql`${creditsTable.totalSpent} + ${amount}`,
      updatedAt: now,
    })
    .where(eq(creditsTable.userId, userId));

  // Record transaction
  await dbase.insert(creditTransactionsTable).values({
    userId,
    amount: -amount,
    type: "generation_spent",
    description,
  });
}

/**
 * Get user's credit transaction history
 */
export async function getCreditHistory(
  userId: string,
  limit: number = 20,
  tx?: Tx,
) {
  const dbase = getDb(tx);
  const result = await dbase
    .select()
    .from(creditTransactionsTable)
    .where(eq(creditTransactionsTable.userId, userId))
    .orderBy(desc(creditTransactionsTable.createdAt))
    .limit(limit);

  return result;
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(
  userId: string,
  requiredAmount: number,
  tx?: Tx,
): Promise<boolean> {
  const creditRecord = await getUserCredits(userId, tx);
  return creditRecord !== null && creditRecord.balance >= requiredAmount;
}

/**
 * Get or create credits record for a user
 */
export async function getOrCreateCredits(userId: string, tx?: Tx) {
  const dbase = getDb(tx);
  const existing = await getUserCredits(userId, tx);

  if (existing) {
    return existing;
  }

  // Create new credits record with 0 balance
  await dbase.insert(creditsTable).values({
    userId,
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
  });

  return {
    userId,
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
