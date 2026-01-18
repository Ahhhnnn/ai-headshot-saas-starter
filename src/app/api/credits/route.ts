import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { getUserCredits, getCreditHistory } from "@/lib/database/credits";

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // 2. Get user's credit balance
    const creditRecord = await getUserCredits(userId);

    // 3. Get credit transaction history
    const transactions = await getCreditHistory(userId, limit);

    // 4. Return response
    return NextResponse.json({
      credits: creditRecord
        ? {
            balance: creditRecord.balance,
            totalEarned: creditRecord.totalEarned,
            totalSpent: creditRecord.totalSpent,
          }
        : {
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
          },
      transactions: transactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        createdAt: tx.createdAt,
      })),
    });
  } catch (error) {
    console.error("Credits API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
