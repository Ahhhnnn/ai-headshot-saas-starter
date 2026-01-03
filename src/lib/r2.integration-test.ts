import { uploadBuffer, deleteFile, getDownloadUrl } from "./r2";
import fs from "fs";
import path from "path";

const TEST_IMAGE_PATH = path.join(process.cwd(), "public/images/hero/hero.jpeg");

async function testRealUpload() {
  // 检查测试图片是否存在
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error(`❌ 错误: 测试图片不存在`);
    console.log(`请将测试图片放置在: ${TEST_IMAGE_PATH}`);
    return;
  }

  const buffer = fs.readFileSync(TEST_IMAGE_PATH);
  const timestamp = Date.now();
  const testKey = `test-uploads/integration-test-${timestamp}.jpg`;

  console.log("=".repeat(50));
  console.log("R2 集成测试 - 真实图片上传");
  console.log("=".repeat(50));
  console.log(`📁 图片大小: ${(buffer.length / 1024).toFixed(2)} KB`);
  console.log(`🔑 测试 Key: ${testKey}`);
  console.log("");

  try {
    // 测试 1: 上传图片
    console.log("📤 测试 1: 上传图片...");
    const uploadResult = await uploadBuffer(buffer, testKey, "image/jpeg");

    if (uploadResult.success) {
      console.log("✅ 上传成功!");
      console.log(`   URL: ${uploadResult.url}`);
      console.log(`   Key: ${uploadResult.key}`);
    } else {
      console.error("❌ 上传失败:", uploadResult.error);
      return;
    }

    // 测试 2: 获取下载链接
    console.log("");
    console.log("🔗 测试 2: 获取下载链接...");
    const downloadUrl = await getDownloadUrl(testKey, 3600);

    if (downloadUrl) {
      console.log("✅ 下载链接获取成功!");
      console.log(`   URL: ${downloadUrl}`);
    } else {
      console.error("❌ 下载链接获取失败");
    }

    // 测试 3: 删除图片（可选 - 如果你想保留文件用于测试，请注释掉这段代码）
    // console.log("");
    // console.log("🗑️ 测试 3: 删除图片...");
    // const deleteResult = await deleteFile(testKey);

    // if (deleteResult.success) {
    //   console.log("✅ 删除成功!");
    // } else {
    //   console.error("❌ 删除失败:", deleteResult.error);
    // }

    console.log("");
    console.log("=".repeat(50));
    console.log("测试完成!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ 测试过程中发生错误:", error);
  }
}

testRealUpload();
