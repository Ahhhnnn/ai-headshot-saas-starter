import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { getStyleById } from "@/lib/config/avatar-styles";
import env from "@/env";

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

    // 4. 检查 API key 是否配置
    if (!env.REPLICATE_API_KEY) {
      return NextResponse.json(
        { error: "AI generation service not configured" },
        { status: 503 },
      );
    }

    // 5. 调用 Replicate API
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 存储任务状态
    generationJobs.set(jobId, {
      status: "processing",
      createdAt: Date.now(),
    });

    // 异步执行生成任务
    generateHeadshot(jobId, inputImageUrl, style.aiPrompt)
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

// 异步生成任务
async function generateHeadshot(
  jobId: string,
  inputImageUrl: string,
  prompt: string,
): Promise<
  { status: "completed"; imageUrl: string } | { status: "failed"; error: string }
> {
  try {
    // 调用 Replicate API
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "HeadshotPro-AI/1.0",
      },
      body: JSON.stringify({
        version:
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c55633708",
        input: {
          prompt: `${prompt}, person based on input image, high quality, professional photography`,
          negative_prompt:
            "blurry, low quality, distorted, deformed, ugly, disfigured, watermark, text",
          image: inputImageUrl,
          strength: 0.7, // Image to Image 强度
          num_outputs: 1,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Replicate API error");
    }

    const prediction = await response.json();

    // 轮询 Replicate 结果
    const result = await pollReplicatePrediction(prediction.id);

    if (result.status === "succeeded" && result.output) {
      return { status: "completed", imageUrl: result.output as string };
    } else {
      return { status: "failed", error: "Generation failed" };
    }
  } catch (error) {
    console.error("Replicate generation error:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 轮询 Replicate 预测结果
async function pollReplicatePrediction(
  predictionId: string,
): Promise<{ status: string; output?: string }> {
  const maxAttempts = 120; // 120 * 5s = 10 分钟
  const pollInterval = 5000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Bearer ${env.REPLICATE_API_KEY}`,
          "User-Agent": "HeadshotPro-AI/1.0",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to poll prediction status");
    }

    const prediction = await response.json();

    if (prediction.status === "succeeded") {
      return { status: "succeeded", output: prediction.output };
    }

    if (prediction.status === "failed") {
      return { status: "failed" };
    }

    // 等待后继续轮询
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  return { status: "timeout" };
}
