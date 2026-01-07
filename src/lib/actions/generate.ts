"use server";

import { auth } from "@/lib/auth/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/database";
import { generations } from "@/database/tables";
import { eq } from "drizzle-orm";

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
    // 1. 验证认证 - 使用 cookies() 获取认证 cookie
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const session = await auth.api.getSession({
      headers: new Headers({ Cookie: cookieHeader }),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. 验证输入
    const validation = generateAvatarSchema.safeParse(input);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return { success: false, error: firstError?.message || "Invalid input" };
    }

    // 3. 直接调用生成逻辑（避免不必要的内部 API 调用）
    const { getStyleById } = await import("@/lib/config/avatar-styles");
    // 确保 V3 provider 已注册
    await import("@/lib/generate/providers/v3");
    const { getProvider } = await import("@/lib/generate/provider");

    const style = getStyleById(input.styleId);
    if (!style) {
      return { success: false, error: "Invalid style ID" };
    }

    const provider = getProvider("v3");
    if (!provider) {
      return { success: false, error: "V3 AI generation provider not found" };
    }

    if (!provider.isConfigured()) {
      return { success: false, error: "V3 AI generation service not configured. Please set V3_API_KEY." };
    }

    const jobId = `v3_image-to-image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 1. 先插入数据库记录 (status: processing)
    await db.insert(generations).values({
      id: jobId,
      userId: session.user.id,
      provider: "v3",
      status: "processing",
      inputImageUrl: input.inputImageUrl,
      prompt: style.aiPrompt,
      styleId: input.styleId,
    });
    console.log(`[Generate] Created generation record in database: ${jobId}`);

    // 2. 后台异步执行生成任务（使用相同的 jobId）
    provider.createGeneration({
      inputImageUrl: input.inputImageUrl,
      prompt: style.aiPrompt,
      styleId: input.styleId,
      userId: session.user.id,
      extra: {
        size: "1:1",
        jobId, // 将 jobId 传递给 provider，确保 ID 一致
      },
    }).catch((error) => {
      console.error(`[Generate] Generation failed for job ${jobId}:`, error);
    });

    return { success: true, jobId };
  } catch (error) {
    console.error("Generate avatar error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 检查单次生成状态（供客户端轮询使用）
export async function getGenerationStatus(
  jobId: string,
): Promise<PollResult> {
  try {
    // 从数据库读取任务状态
    const [result] = await db
      .select()
      .from(generations)
      .where(eq(generations.id, jobId))
      .limit(1);

    if (!result) {
      return { id: jobId, status: "failed", error: "Generation not found" };
    }

    if (result.status === "failed") {
      return { id: jobId, status: "failed", error: result.error || "Generation failed" };
    }

    if (result.status === "completed" && result.outputImageUrl) {
      console.log(`[Generate] Generation completed for job ${jobId}`);
      console.log(`[Generate] Original image URL from V3: ${result.outputImageUrl}`);

      // Upload to R2 if not already uploaded
      if (!result.outputImageUrl.includes("r2.dev")) {
        console.log(`[Generate] Uploading generated image to R2 for job ${jobId}`);
        const { uploadFromUrl } = await import("@/lib/r2");
        const timestamp = Date.now();
        const key = `generated/${jobId}/${timestamp}.jpg`;

        const uploadResult = await uploadFromUrl(
          result.outputImageUrl,
          key,
          "image/jpeg"
        );

        if (uploadResult.success && uploadResult.url) {
          console.log(`[Generate] Successfully uploaded to R2: ${uploadResult.url}`);
          // Update the database with the R2 URL
          await db
            .update(generations)
            .set({ outputImageUrl: uploadResult.url, updatedAt: new Date() })
            .where(eq(generations.id, jobId));
          return { id: jobId, status: "completed", imageUrl: uploadResult.url };
        } else {
          console.error(`[Generate] Failed to upload to R2: ${uploadResult.error}`);
          // Fall back to original URL if upload fails
          return { id: jobId, status: "completed", imageUrl: result.outputImageUrl };
        }
      }

      console.log(`[Generate] Image already in R2, using existing URL`);
      return { id: jobId, status: "completed", imageUrl: result.outputImageUrl };
    }

    // 仍在处理中
    return { id: jobId, status: result.status as "pending" | "processing" };
  } catch (error) {
    console.error("Get generation status error:", error);
    return {
      id: jobId,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
