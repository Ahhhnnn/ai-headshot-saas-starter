"use server";

import { auth } from "@/lib/auth/server";
import { cookies } from "next/headers";
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

    const jobId = `v3_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 创建生成任务
    const result = await provider.createGeneration({
      inputImageUrl: input.inputImageUrl,
      prompt: style.aiPrompt,
      styleId: input.styleId,
      userId: session.user.id,
      extra: {
        size: "1:1",
      },
    });

    if (result.status === "failed") {
      return { success: false, error: "Failed to create generation task" };
    }

    return { success: true, jobId: result.jobId };
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
    // 确保 V3 provider 已注册
    await import("@/lib/generate/providers/v3");
    const { getProvider } = await import("@/lib/generate/provider");
    const provider = getProvider("v3");

    if (!provider) {
      return { id: jobId, status: "failed", error: "Provider not found" };
    }

    const result = await provider.getGenerationStatus(jobId);

    if (result.status === "completed" && result.imageUrl) {
      console.log(`[Generate] Generation completed for job ${jobId}`);
      console.log(`[Generate] Original image URL from V3: ${result.imageUrl}`);

      // Upload to R2 if not already uploaded
      if (!result.imageUrl.includes("r2.dev")) {
        console.log(`[Generate] Uploading generated image to R2 for job ${jobId}`);
        const { uploadFromUrl } = await import("@/lib/r2");
        const timestamp = Date.now();
        const key = `generated/${jobId}/${timestamp}.jpg`;

        const uploadResult = await uploadFromUrl(
          result.imageUrl,
          key,
          "image/jpeg"
        );

        if (uploadResult.success && uploadResult.url) {
          console.log(`[Generate] Successfully uploaded to R2: ${uploadResult.url}`);
          return { id: jobId, status: "completed", imageUrl: uploadResult.url };
        } else {
          console.error(`[Generate] Failed to upload to R2: ${uploadResult.error}`);
          // Fall back to original URL if upload fails
          return { id: jobId, status: "completed", imageUrl: result.imageUrl };
        }
      }

      console.log(`[Generate] Image already in R2, using existing URL`);
      return { id: jobId, status: "completed", imageUrl: result.imageUrl };
    }

    if (result.status === "failed") {
      return { id: jobId, status: "failed", error: result.error };
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
