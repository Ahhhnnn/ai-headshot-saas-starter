#!/usr/bin/env tsx
/**
 * V3 Provider Integration Test Script
 *
 * Usage:
 *   npx tsx scripts/test-v3-generation.ts
 *
 * Required environment variables:
 *   V3_API_KEY - Your V3 API key
 *   V3_API_BASE_URL - V3 API base URL (default: https://api.gpt.ge)
 */

import { V3Provider } from "../src/lib/generate/providers/v3";

async function test() {
  const apiKey = process.env.V3_API_KEY;
  const baseUrl = process.env.V3_API_BASE_URL;

  if (!apiKey) {
    console.error("❌ V3_API_KEY environment variable is required");
    console.log("\nPlease set it:");
    console.log("  export V3_API_KEY='your_api_key'");
    console.log("  export V3_API_BASE_URL='https://api.gpt.ge'");
    console.log("\nThen run this script again.");
    process.exit(1);
  }

  console.log("🚀 Starting V3 Integration Test");
  console.log("─".repeat(50));

  const provider = new V3Provider();

  // Check configuration
  console.log(`Provider: ${provider.name}`);
  console.log(`Configured: ${provider.isConfigured()}`);
  console.log(`API Base URL: ${baseUrl || "https://api.gpt.ge"}`);
  console.log("");

  // Test image generation
  const input = {
    styleId: "professional",
    userId: "test_user",
    prompt: "A professional headshot photo of a person, high quality, studio lighting",
  };

  console.log("📝 Prompt:", input.prompt);
  console.log("");

  try {
    console.log("⏳ Creating generation task...");
    const result = await provider.createGeneration(input);
    console.log(`✅ Job created: ${result.jobId}`);
    console.log(`   Status: ${result.status}`);
    console.log("");

    console.log("⏳ Waiting for generation to complete...");
    // Wait for generation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check status
    const status = await provider.getGenerationStatus(result.jobId);
    console.log(`📊 Status: ${status.status}`);
    console.log(`   Provider: ${status.metadata?.provider}`);

    if (status.imageUrl) {
      console.log(`🖼️  Image URL: ${status.imageUrl}`);
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
      console.log("\n⚠️  Test INCOMPLETE - Generation still in progress");
      console.log("   Please check the status later using the job ID.");
    }
  } catch (error) {
    console.error("\n❌ Test FAILED with exception:");
    console.error(error);
    process.exit(1);
  }
}

test();
