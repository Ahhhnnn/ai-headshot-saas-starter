/**
 * V3 Text-to-Image Integration Test (文生图集成测试)
 *
 * This test makes real API calls to the V3 (nano-banana) image generation service.
 *
 * To run this test:
 *   npx tsx src/lib/generate/providers/v3.integration-test.ts
 *
 * Required environment variables in .env:
 *   V3_API_KEY - Your V3 API key
 *   V3_API_BASE_URL - V3 API base URL (default: https://api.v3.cm)
 *
 * Note: This test will make actual API calls and may incur costs.
 */

import { config } from "dotenv";
import { resolve, join } from "path";
import fs from "fs";

// Load .env file first
config({ path: resolve(process.cwd(), ".env") });

// V3 API 配置 - 直接从 process.env 读取
const V3_API_KEY = process.env.V3_API_KEY;
const V3_API_BASE_URL = process.env.V3_API_BASE_URL || "https://api.v3.cm";

// ============ 下载图片并保存 ============

async function downloadAndSaveImage(url: string, outputPath: string): Promise<boolean> {
  console.log(`📥 Downloading image to: ${outputPath}`);

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`❌ Download failed: ${response.status}`);
    return false;
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
  console.log(`✅ Image saved! Size: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
  return true;
}

// ============ 测试主函数 ============

async function testV3Generation() {
  console.log("=".repeat(50));
  console.log("V3 文生图集成测试 - Text-to-Image");
  console.log("=".repeat(50));
  console.log(`🔑 API Key: ${V3_API_KEY ? "已配置" : "未配置"}`);
  console.log(`🌐 API URL: ${V3_API_BASE_URL}`);
  console.log("");

  if (!V3_API_KEY) {
    console.error("❌ 错误: V3_API_KEY 未配置");
    console.log("\n请在 .env 文件中配置:");
    console.log("  V3_API_KEY=your_api_key");
    console.log("  V3_API_BASE_URL=https://api.v3.cm");
    return;
  }

  // 直接使用 V3Provider 类
  const { V3Provider } = await import("./v3");

  const provider = new V3Provider();
  console.log(`Provider: ${provider.name}`);
  console.log(`Configured: ${provider.isConfigured()}`);
  console.log("");

  // 使用更详细的 prompt，避免触发 Gemini 的安全过滤
  const prompt = "A professional business headshot photograph of a smiling woman with brown hair, wearing a navy blue blazer, against a clean gray background, studio lighting, high quality, sharp focus, professional portrait photography";
  console.log("📝 Prompt:", prompt);
  console.log("");

  try {
    // 调用 V3Provider 进行文生图
    console.log("⏳ Creating text-to-image generation task...");

    const result = await provider.createGeneration({
      prompt,
      styleId: "professional",
      userId: "integration_test",
      extra: { size: "1024x1024" },
    });

    console.log(`✅ Job created: ${result.jobId}`);
    console.log(`   Status: ${result.status}`);
    console.log("");

    // 轮询等待生成完成
    console.log("⏳ Polling for generation to complete...");
    let status = await provider.getGenerationStatus(result.jobId);
    const maxRetries = 30;
    let retries = 0;

    while (status.status === "pending" && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries++;
      status = await provider.getGenerationStatus(result.jobId);
      console.log(`   [${retries}/${maxRetries}] Status: ${status.status}`);
    }

    console.log(`📊 Final Status: ${status.status}`);
    console.log(`   Provider: ${status.metadata?.provider}`);

    if (status.imageUrl) {
      console.log(`🖼️  Image URL: ${status.imageUrl}`);
      console.log("");

      // 保存结果到本地
      const outputDir = join(process.cwd(), "test-output");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = join(outputDir, `v3-test-${Date.now()}.jpg`);
      const success = await downloadAndSaveImage(status.imageUrl, outputPath);

      if (success) {
        console.log("\n🎉 文生图测试完成! 结果已保存到:");
        console.log(`   ${outputPath}`);
      }
    }

    if (status.error) {
      console.log(`❌ Error: ${status.error}`);
    }

    if (status.status === "completed") {
      console.log("\n✅ Test PASSED - Image generated successfully!");
    } else if (status.status === "failed") {
      console.log("\n❌ Test FAILED - Image generation failed");
      process.exit(1);
    } else {
      console.log("\n⚠️  Test INCOMPLETE - Generation timed out");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Test FAILED with exception:");
    console.error(error);
    process.exit(1);
  }
}

testV3Generation();
