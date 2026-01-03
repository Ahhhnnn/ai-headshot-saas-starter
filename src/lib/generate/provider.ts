/**
 * 图片生成 Provider 抽象接口
 *
 * 所有图片生成 provider 都必须实现此接口
 * 当前支持: replicate, v3
 */

import { z } from "zod";

// ============ 类型定义 ============

// 任务状态
export type GenerationStatus =
  | "pending"   // 任务已创建，等待处理
  | "processing" // 处理中
  | "completed"  // 完成
  | "failed";    // 失败

// 生成结果
export interface GenerationResult {
  status: GenerationStatus;
  imageUrl?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

// Provider 配置
export interface ProviderConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

// 输入参数
export interface GenerateInput {
  /** 输入图片 URL (图生图场景) */
  inputImageUrl?: string;
  /** 风格 ID */
  styleId: string;
  /** 用户 ID */
  userId: string;
  /** 提示词 (文生图场景) */
  prompt?: string;
  /** 额外参数 */
  extra?: Record<string, unknown>;
}

// ============ Provider 抽象接口 ============

export interface ImageGenerationProvider {
  // Provider 标识符
  readonly id: string;
  readonly name: string;

  // 检查配置是否有效
  isConfigured(): boolean;

  // 创建生成任务
  createGeneration(input: GenerateInput): Promise<{
    jobId: string;
    status: GenerationStatus;
  }>;

  // 获取生成状态
  getGenerationStatus(jobId: string): Promise<GenerationResult>;

  // 取消生成任务
  cancelGeneration(jobId: string): Promise<boolean>;
}

// ============ Provider 工厂 ============

export type ProviderId = "replicate" | "v3";

const providerRegistry = new Map<ProviderId, () => ImageGenerationProvider>();

export function registerProvider(id: ProviderId, factory: () => ImageGenerationProvider): void {
  providerRegistry.set(id, factory);
}

export function getProvider(id: ProviderId): ImageGenerationProvider | null {
  const factory = providerRegistry.get(id);
  return factory ? factory() : null;
}

export function getAvailableProviders(): ProviderId[] {
  return Array.from(providerRegistry.keys());
}

// ============ 通用验证 Schema ============

export const generateInputSchema = z.object({
  inputImageUrl: z.string().startsWith("http", "Invalid image URL"),
  styleId: z.string().min(1, "Style ID is required"),
  provider: z.enum(["replicate", "v3"]).optional().default("v3"),
});

export type GenerateInputSchema = z.infer<typeof generateInputSchema>;
