/**
 * V3 Image-to-Image Integration Test (图生图集成测试)
 *
 * This test makes real API calls to the V3 (nano-banana) image editing service.
 *
 * To run this test:
 *   npx tsx src/lib/generate/providers/v3.image2image.integration-test.ts
 *
 * Required environment variables in .env:
 *   V3_API_KEY - Your V3 API key
 *   V3_API_BASE_URL - V3 API base URL (default: https://api.v3.cm)
 *   INPUT_IMAGE_URL - URL of the input image to edit
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

// 输入图片 URL - 可以通过环境变量设置
const INPUT_IMAGE_URL = process.env.INPUT_IMAGE_URL || "https://pub-b5d1af0761bb4c058c903c11e46cd681.r2.dev/test-uploads/v3-test-1767453617106.jpg";

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

// ============ 图生图主函数 ============

async function testV3ImageToImage() {
  console.log("=".repeat(50));
  console.log("V3 图生图集成测试 - Image-to-Image");
  console.log("=".repeat(50));
  console.log(`🔑 API Key: ${V3_API_KEY ? "已配置" : "未配置"}`);
  console.log(`🌐 API URL: ${V3_API_BASE_URL}`);
  console.log(`🖼️  Input Image: ${INPUT_IMAGE_URL}`);
  console.log("");

  if (!V3_API_KEY) {
    console.error("❌ 错误: V3_API_KEY 未配置");
    console.log("\n请在 .env 文件中配置:");
    console.log("  V3_API_KEY=your_api_key");
    console.log("  V3_API_BASE_URL=https://api.v3.cm");
    console.log("  INPUT_IMAGE_URL=https://example.com/input-image.jpg");
    return;
  }

  // 直接使用 V3Provider 类
  const { V3Provider } = await import("./v3");

  const provider = new V3Provider();
  console.log(`Provider: ${provider.name}`);
  console.log(`Configured: ${provider.isConfigured()}`);
  console.log("");

  const prompt = "Tech startup founder headshot, modern professional look, clean minimalist background, tech industry style, approachable yet professional, high quality, 4K";
  console.log("📝 Prompt:", prompt);
  console.log("📝 Input Image URL:", INPUT_IMAGE_URL);
  console.log("");

  try {
    // 调用 V3Provider 进行图生图
    console.log("⏳ Creating image-to-image generation task...");

    const result = await provider.createGeneration({
      inputImageUrl: INPUT_IMAGE_URL,
      prompt,
      styleId: "professional",
      userId: "integration_test",
      extra: { size: "1:1" },
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

      const outputPath = join(outputDir, `v3-img2img-${Date.now()}.jpg`);
      const success = await downloadAndSaveImage(status.imageUrl, outputPath);

      if (success) {
        console.log("\n🎉 图生图测试完成! 结果已保存到:");
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

testV3ImageToImage();
