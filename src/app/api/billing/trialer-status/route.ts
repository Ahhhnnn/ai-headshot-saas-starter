import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { hasTrialerBeenPurchased } from "@/lib/database/credits";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ hasPurchased: false }, { status: 200 });
    }

    const hasPurchased = await hasTrialerBeenPurchased(session.user.id);

    return NextResponse.json({ hasPurchased });
  } catch (error) {
    console.error("[Trialer Status API Error]", error);
    return NextResponse.json(
      { error: "Failed to check trialer status" },
      { status: 500 }
    );
  }
}
