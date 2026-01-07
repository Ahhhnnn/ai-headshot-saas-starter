/**
 * V3 (nano-banana) 图片生成 Provider 实现
 *
 * 对接 V3 平台进行 AI 图片生成 (基于 GPT.ge 的 nano-banana API)
 * 支持:
 * - 文生图 (text-to-image): /v1/images/generations
 * - 图生图 (image-to-image): /v1/images/edits
 *
 * API 文档:
 * - 文生图: docs/v3_api.md
 * - 图生图: docs/v3_api_image2image.md
 *
 * 需要配置的环境变量:
 * - V3_API_KEY: V3 平台的 API Key
 * - V3_API_BASE_URL: V3 API 基础地址 (可选，默认 https://api.gpt.ge)
 */

import { db } from "@/database";
import { generations } from "@/database/tables";
import { eq } from "drizzle-orm";
import env from "@/env";
import type {
  ImageGenerationProvider,
  GenerateInput,
  GenerationResult,
} from "../provider";

// ============ V3 API 类型定义 ============

// 生成类型枚举
export type V3GenerationType = "text-to-image" | "image-to-image";

// V3 支持的模型
export type V3Model =
  | "nano-banana"
  | "nano-banana-pro"
  | "nano-banana-pro-2k"
  | "nano-banana-pro-4k"
  | "gemini-3-pro-image-preview"
  | "gemini-2.5-flash-image";

// 文生图请求参数
interface V3TextToImageRequest {
  prompt: string;
  model: V3Model;
  response_format: "url" | "b64_json";
  size?: string;
}

// 图生图请求参数 (multipart/form-data)
// 注意: 这个接口用于类型参考，实际请求使用 FormData 构建
interface V3ImageToImageRequest {
  image: File | File[];
  prompt: string;
  model: V3Model;
  response_format?: "url" | "b64_json";
  size?: string;
  aspect_ratio?: string;
}

// 响应数据结构
interface V3GenerationResponseData {
  b64_json?: string;
  url?: string;
}

// 响应结构
interface V3GenerationResponse {
  created: number;
  data: V3GenerationResponseData[];
  usage?: {
    input_tokens: number;
    input_tokens_details: {
      image_tokens: number;
      text_tokens: number;
    };
    output_tokens: number;
    total_tokens: number;
  };
}

// 错误响应
interface V3ErrorResponse {
  error?: {
    message: string;
    type: string;
  };
}

// ============ V3 Provider 实现 ============

export class V3Provider implements ImageGenerationProvider {
  readonly id = "v3";
  readonly name = "V3 Nano-Banana Image Generator";

  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Support both env.js and direct process.env for testing
    this.apiKey = env.V3_API_KEY || process.env.V3_API_KEY || "";
    this.baseUrl = env.V3_API_BASE_URL || process.env.V3_API_BASE_URL || "https://api.gpt.ge";
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * 判断生成类型 (文生图 vs 图生图)
   */
  private determineGenerationType(input: GenerateInput): V3GenerationType {
    return input.inputImageUrl ? "image-to-image" : "text-to-image";
  }

  async createGeneration(input: GenerateInput): Promise<{
    jobId: string;
    status: "pending" | "processing" | "completed" | "failed";
  }> {
    // 从输入中获取 jobId（如果已生成），否则内部生成
    let jobId = input.extra?.jobId as string | undefined;
    if (!jobId) {
      const generationType = this.determineGenerationType(input);
      jobId = `v3_${generationType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    console.log(`[V3] Creating generation job: ${jobId}`);

    // 异步执行生成任务
    this.executeGeneration(jobId, input).catch((error) => {
      console.error(`[V3] Generation failed for job ${jobId}:`, error);
      // 更新数据库为失败状态
      this.updateGenerationStatus(jobId, "failed", null, error instanceof Error ? error.message : "Unknown error");
    });

    return {
      jobId,
      status: "processing",
    };
  }

  async getGenerationStatus(jobId: string): Promise<GenerationResult> {
    try {
      const [result] = await db
        .select()
        .from(generations)
        .where(eq(generations.id, jobId))
        .limit(1);

      if (!result) {
        return {
          status: "pending",
          metadata: { provider: this.id },
        };
      }

      if (result.status === "failed") {
        return {
          status: "failed",
          error: result.error || "Generation failed",
          metadata: { provider: this.id },
        };
      }

      if (result.status === "completed" && result.outputImageUrl) {
        return {
          status: "completed",
          imageUrl: result.outputImageUrl,
          metadata: { provider: this.id },
        };
      }

      return {
        status: result.status as "pending" | "processing",
        metadata: { provider: this.id },
      };
    } catch (error) {
      console.error(`[V3] Error fetching status for job ${jobId}:`, error);
      return {
        status: "pending",
        metadata: { provider: this.id },
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async cancelGeneration(_jobId: string): Promise<boolean> {
    return true;
  }

  /**
   * 更新数据库中的任务状态
   */
  private async updateGenerationStatus(
    jobId: string,
    status: string,
    outputImageUrl: string | null,
    error: string | null,
  ): Promise<void> {
    try {
      await db
        .update(generations)
        .set({
          status,
          outputImageUrl,
          error,
          updatedAt: new Date(),
        })
        .where(eq(generations.id, jobId));
      console.log(`[V3] Updated database status for job ${jobId}: ${status}`);
    } catch (dbError) {
      console.error(`[V3] Failed to update database for job ${jobId}:`, dbError);
    }
  }

  // ============ 私有方法 ============

  private async executeGeneration(
    jobId: string,
    input: GenerateInput,
  ): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("V3 API key not configured");
    }

    const generationType = this.determineGenerationType(input);
    console.log(`[V3] Executing ${generationType} for job ${jobId}`);

    try {
      let response: V3GenerationResponse;

      if (generationType === "image-to-image") {
        response = await this.callImageToImageAPI(input);
      } else {
        response = await this.callTextToImageAPI(input);
      }

      console.log(`[V3] Response received for job ${jobId}, data length: ${response.data?.length}`);

      if (response.data && response.data.length > 0) {
        const imageUrl = response.data[0].url || null;
        // 更新数据库为完成状态
        await this.updateGenerationStatus(jobId, "completed", imageUrl, null);
        console.log(`[V3] Job ${jobId} completed successfully`);
      } else {
        throw new Error("No image data in response");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[V3] Job ${jobId} failed: ${errorMessage}`);
      // 更新数据库为失败状态
      await this.updateGenerationStatus(jobId, "failed", null, errorMessage);
      throw error;
    }
  }

  /**
   * 文生图 API 调用
   */
  private async callTextToImageAPI(
    input: GenerateInput,
  ): Promise<V3GenerationResponse> {
    const requestBody: V3TextToImageRequest = {
      prompt: input.prompt || "Generate a professional headshot photo",
      model: "nano-banana",
      response_format: "url",
    };

    // size 参数 - 头像场景使用 1:1
    requestBody.size = input.extra?.size as string || "1024x1024";

    const url = `${this.baseUrl}/v1/images/generations`;
    console.log(`[V3] Calling text-to-image API: ${url}`);
    console.log(`[V3] Request body:`, JSON.stringify(requestBody, null, 2));

    // 添加超时控制 (30秒)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "HeadshotPro-AI/1.0",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`[V3] Response status: ${response.status}`);
      console.log(`[V3] Response ok: ${response.ok}`);

      if (!response.ok) {
        const error: V3ErrorResponse = await response.json();
        throw new Error(error.error?.message || `V3 API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[V3] API request failed:`, error);
      throw error;
    }
  }

  /**
   * 图生图 API 调用
   * 使用 multipart/form-data 格式
   */
  private async callImageToImageAPI(
    input: GenerateInput,
  ): Promise<V3GenerationResponse> {
    if (!input.inputImageUrl) {
      throw new Error("inputImageUrl is required for image-to-image generation");
    }

    // 下载输入图片并转换为 File
    const imageFile = await this.downloadImageAsFile(input.inputImageUrl);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("prompt", input.prompt || "Edit this image professionally");
    formData.append("model", "nano-banana");
    formData.append("response_format", "url");

    // size 参数 - 头像场景使用 1:1
    const size = input.extra?.size as string || "1:1";
    formData.append("size", size);

    const url = `${this.baseUrl}/v1/images/edits`;
    console.log(`[V3] Calling image-to-image API: ${url}`);
    console.log(`[V3] Image: ${input.inputImageUrl}`);
    console.log(`[V3] Prompt: ${input.prompt}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "User-Agent": "HeadshotPro-AI/1.0",
        // 注意: 不要设置 Content-Type，让 fetch 自动设置 multipart/form-data
      },
      body: formData,
    });

    if (!response.ok) {
      const error: V3ErrorResponse = await response.json();
      throw new Error(error.error?.message || `V3 API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 下载图片并转换为 File 对象
   */
  private async downloadImageAsFile(url: string): Promise<File> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const blob = await response.blob();

    // 从 URL 推断文件名
    const filename = url.split("/").pop() || "image.jpg";
    const mimeType = blob.type || "image/jpeg";

    return new File([blob], filename, { type: mimeType });
  }
}

// ============ 注册 Provider ============

import { registerProvider } from "../provider";

registerProvider("v3", () => new V3Provider());
