import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { getStyleById } from "@/lib/config/avatar-styles";
import { getProvider } from "@/lib/generate/provider";
import type { GenerateInput } from "@/lib/generate/provider";

// 生成请求类型
interface GenerateRequest {
  inputImageUrl: string;
  styleId: string;
}

// 存储进行中的任务 (生产环境应使用 Redis 或数据库)
const generationJobs = new Map<
  string,
  {
    status: "pending" | "processing" | "completed" | "failed";
    imageUrl?: string;
    error?: string;
    createdAt: number;
  }
>();

export async function POST(request: NextRequest) {
  try {
    // 1. 认证检查
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 解析请求
    const body: GenerateRequest = await request.json();
    const { inputImageUrl, styleId } = body;

    // 3. 验证输入
    if (!inputImageUrl || typeof inputImageUrl !== "string") {
      return NextResponse.json(
        { error: "Invalid input image URL" },
        { status: 400 },
      );
    }

    const style = getStyleById(styleId);
    if (!style) {
      return NextResponse.json({ error: "Invalid style ID" }, { status: 400 });
    }

    // 4. 使用 V3 Provider 进行图生图生成
    const provider = getProvider("v3");

    if (!provider) {
      return NextResponse.json(
        { error: "V3 AI generation provider not found" },
        { status: 503 },
      );
    }

    if (!provider.isConfigured()) {
      return NextResponse.json(
        { error: "V3 AI generation service not configured. Please set V3_API_KEY." },
        { status: 503 },
      );
    }

    const jobId = `v3_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 存储任务状态
    generationJobs.set(jobId, {
      status: "processing",
      createdAt: Date.now(),
    });

    // 异步执行生成任务 (图生图)
    generateHeadshot(provider, jobId, inputImageUrl, style.aiPrompt, session.user.id)
      .then((result) => {
        generationJobs.set(jobId, {
          ...result,
          createdAt: Date.now(),
        });
      })
      .catch((error) => {
        console.error("Generation failed:", error);
        generationJobs.set(jobId, {
          status: "failed",
          error: error instanceof Error ? error.message : "Generation failed",
          createdAt: Date.now(),
        });
      });

    return NextResponse.json({
      success: true,
      jobId,
      message: "Generation started",
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 状态检查接口
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }

  const job = generationJobs.get(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // 清理旧任务 (超过 1 小时)
  if (Date.now() - job.createdAt > 60 * 60 * 1000) {
    generationJobs.delete(jobId);
    return NextResponse.json({ error: "Job expired" }, { status: 410 });
  }

  return NextResponse.json({
    jobId,
    status: job.status,
    imageUrl: job.imageUrl,
    error: job.error,
  });
}

// 异步生成任务 - 使用 V3 Provider 图生图
async function generateHeadshot(
  provider: ReturnType<typeof getProvider>,
  jobId: string,
  inputImageUrl: string,
  prompt: string,
  userId: string,
): Promise<
  { status: "completed"; imageUrl: string } | { status: "failed"; error: string }
> {
  try {
    console.log(`[Avatar API] Starting V3 image-to-image generation for job ${jobId}`);
    console.log(`[Avatar API] Input image: ${inputImageUrl}`);
    console.log(`[Avatar API] Prompt: ${prompt}`);

    // 构建生成输入 - 使用 V3 图生图
    const input: GenerateInput = {
      inputImageUrl,
      prompt,
      styleId: "default",
      userId,
      extra: {
        size: "1:1",
      },
    };

    // 调用 V3 Provider 创建生成任务 (图生图)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const result = await provider!.createGeneration(input);

    console.log(`[Avatar API] V3 job created: ${result.jobId}, status: ${result.status}`);

    // 轮询 V3 生成状态
    const finalResult = await pollV3Generation(provider!, result.jobId);

    if (finalResult.status === "completed" && finalResult.imageUrl) {
      console.log(`[Avatar API] Job ${jobId} completed with URL: ${finalResult.imageUrl}`);
      return { status: "completed", imageUrl: finalResult.imageUrl };
    } else {
      console.error(`[Avatar API] Job ${jobId} failed: ${finalResult.error}`);
      return { status: "failed", error: finalResult.error || "Generation failed" };
    }
  } catch (error) {
    console.error("[Avatar API] V3 generation error:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 轮询 V3 生成结果
async function pollV3Generation(
  provider: NonNullable<ReturnType<typeof getProvider>>,
  jobId: string,
): Promise<{ status: "completed" | "failed"; imageUrl?: string; error?: string }> {
  const maxAttempts = 60; // 60 * 5s = 5 分钟
  const pollInterval = 5000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await provider.getGenerationStatus(jobId);

    console.log(`[Avatar API] Poll attempt ${attempt + 1}/${maxAttempts}, status: ${result.status}`);

    if (result.status === "completed" && result.imageUrl) {
      return { status: "completed", imageUrl: result.imageUrl };
    }

    if (result.status === "failed") {
      return { status: "failed", error: result.error };
    }

    // 等待后继续轮询
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  return { status: "failed", error: "Timeout waiting for generation" };
}
