"use server";

import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { z } from "zod";

// 验证输入 schema
const generateAvatarSchema = z.object({
  inputImageUrl: z.string().url("Invalid image URL"),
  styleId: z.string().min(1, "Style ID is required"),
});

export interface GenerateAvatarResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface PollResult {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl?: string;
  error?: string;
}

// 生成头像
export async function generateAvatar(
  input: z.infer<typeof generateAvatarSchema>,
): Promise<GenerateAvatarResult> {
  try {
    // 1. 验证认证
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. 验证输入
    const validation = generateAvatarSchema.safeParse(input);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return { success: false, error: firstError?.message || "Invalid input" };
    }

    // 3. 调用 AI 生成 API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/generate/avatar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.id}`,
        },
        body: JSON.stringify({
          inputImageUrl: input.inputImageUrl,
          styleId: input.styleId,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Generation failed" };
    }

    return { success: true, jobId: data.jobId };
  } catch (error) {
    console.error("Generate avatar error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 轮询生成状态
export async function pollGenerationStatus(
  jobId: string,
  options?: {
    onProgress?: (progress: number) => void;
    maxAttempts?: number;
  },
): Promise<PollResult> {
  const maxAttempts = options?.maxAttempts ?? 60;
  const pollInterval = 5000; // 5 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/generate/avatar/status?jobId=${jobId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.status === "failed") {
          return { id: jobId, status: "failed", error: data.error };
        }
      }

      if (data.status === "completed" && data.imageUrl) {
        return { id: jobId, status: "completed", imageUrl: data.imageUrl };
      }

      if (data.status === "failed") {
        return { id: jobId, status: "failed", error: data.error };
      }

      // 计算进度
      const progress = Math.min(Math.round((attempt / maxAttempts) * 100), 95);
      options?.onProgress?.(progress);

      // 等待后继续轮询
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error("Poll status error:", error);
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  return { id: jobId, status: "failed", error: "Timeout waiting for generation" };
}
