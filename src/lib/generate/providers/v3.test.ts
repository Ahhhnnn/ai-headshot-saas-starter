import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch as typeof fetch;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type V3Provider = any;

describe("lib/generate/providers/v3", () => {
  let provider: V3Provider;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocks before creating a new provider
    jest.resetModules();

    // Mock env after resetting modules
    jest.doMock("@/env", () => ({
      __esModule: true,
      default: {
        V3_API_KEY: "test-api-key",
        V3_API_BASE_URL: "https://api.gpt.ge",
        DATABASE_URL: "postgresql://test:test@localhost:5432/test_db",
        BETTER_AUTH_SECRET: "mock-secret",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        RESEND_API_KEY: "mock-resend-key",
        R2_ENDPOINT: "https://mock-endpoint.r2.cloudflarestorage.com",
        R2_ACCESS_KEY_ID: "mock-access-key",
        R2_SECRET_ACCESS_KEY: "mock-secret-key",
        R2_BUCKET_NAME: "mock-bucket",
        R2_PUBLIC_URL: "https://mock-public-url.com",
        CREEM_API_KEY: "mock-creem-api-key",
        CREEM_ENVIRONMENT: "test_mode",
        CREEM_WEBHOOK_SECRET: "mock-webhook-secret",
        REPLICATE_API_KEY: undefined,
      },
    }));

    // Re-require the provider after mocking env
    const V3ProviderModule = require("./v3");
    provider = new V3ProviderModule.V3Provider();
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe("V3Provider", () => {
    describe("constructor", () => {
      it("should initialize with default base URL", () => {
        const testProvider = new (require("./v3").V3Provider)();
        expect(testProvider).toBeInstanceOf(require("./v3").V3Provider);
      });

      it("should have correct id and name", () => {
        expect(provider.id).toBe("v3");
        expect(provider.name).toBe("V3 Nano-Banana Image Generator");
      });
    });

    describe("isConfigured", () => {
      it("should return true when API key is configured", () => {
        expect(provider.isConfigured()).toBe(true);
      });
    });

    describe("createGeneration", () => {
      it("should return a jobId and processing status", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        // Mock a successful API response
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            created: Date.now(),
            data: [{ url: "https://example.com/generated-image.jpg" }],
            usage: {
              input_tokens: 100,
              input_tokens_details: { image_tokens: 0, text_tokens: 100 },
              output_tokens: 50,
              total_tokens: 150,
            },
          }),
          status: 200,
        } as Response);

        const result = await provider.createGeneration(input);

        expect(result).toHaveProperty("jobId");
        expect(result.jobId).toMatch(/^v3_\d+_[a-z0-9]+$/);
        expect(result.status).toBe("processing");
      });

      it("should handle API errors gracefully", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        // Mock an API error
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            error: { message: "Invalid API key", type: "authentication_error" },
          }),
          status: 401,
        } as Response);

        const result = await provider.createGeneration(input);

        expect(result).toHaveProperty("jobId");
        expect(result.status).toBe("processing");
      });

      it("should handle network errors", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        // Mock a network error
        mockFetch.mockRejectedValue(new Error("Network error"));

        const result = await provider.createGeneration(input);

        expect(result).toHaveProperty("jobId");
        expect(result.status).toBe("processing");
      });
    });

    describe("getGenerationStatus", () => {
      it("should return pending status for unknown jobId", async () => {
        const result = await provider.getGenerationStatus("unknown_job_id");

        expect(result.status).toBe("pending");
        expect(result.metadata).toHaveProperty("provider", "v3");
      });

      it("should return completed status when image is generated", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        // Mock successful response
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            created: Date.now(),
            data: [{ url: "https://example.com/generated-image.jpg" }],
            usage: {
              input_tokens: 100,
              input_tokens_details: { image_tokens: 0, text_tokens: 100 },
              output_tokens: 50,
              total_tokens: 150,
            },
          }),
          status: 200,
        } as Response);

        // Start generation
        const { jobId } = await provider.createGeneration(input);

        // Wait for async operation to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        const result = await provider.getGenerationStatus(jobId);

        expect(result.status).toBe("completed");
        expect(result.imageUrl).toBe("https://example.com/generated-image.jpg");
      });

      it("should return failed status when API returns error", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        // Mock error response
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            error: { message: "Prompt contains prohibited content", type: "invalid_request_error" },
          }),
          status: 400,
        } as Response);

        // Start generation
        const { jobId } = await provider.createGeneration(input);

        // Wait for async operation
        await new Promise((resolve) => setTimeout(resolve, 100));

        const result = await provider.getGenerationStatus(jobId);

        expect(result.status).toBe("failed");
        expect(result.error).toContain("Prompt contains prohibited content");
      });

      it("should handle b64_json response format", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

        // Mock base64 response
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            created: Date.now(),
            data: [{ b64_json: base64Image }],
            usage: {
              input_tokens: 100,
              input_tokens_details: { image_tokens: 0, text_tokens: 100 },
              output_tokens: 50,
              total_tokens: 150,
            },
          }),
          status: 200,
        } as Response);

        const { jobId } = await provider.createGeneration(input);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const result = await provider.getGenerationStatus(jobId);

        expect(result.status).toBe("completed");
        expect(result.metadata).toHaveProperty("b64_json", base64Image);
      });
    });

    describe("cancelGeneration", () => {
      it("should always return true (synchronous API cannot be cancelled)", async () => {
        const result = await provider.cancelGeneration("any_job_id");
        expect(result).toBe(true);
      });
    });

    describe("API request parameters", () => {
      it("should call API with correct model (nano-banana)", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            created: Date.now(),
            data: [{ url: "https://example.com/image.jpg" }],
            usage: {
              input_tokens: 100,
              input_tokens_details: { image_tokens: 0, text_tokens: 100 },
              output_tokens: 50,
              total_tokens: 150,
            },
          }),
          status: 200,
        } as Response);

        await provider.createGeneration(input);

        // Verify fetch was called with correct parameters
        expect(mockFetch).toHaveBeenCalledWith(
          "https://api.gpt.ge/v1/images/generations",
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              Authorization: "Bearer test-api-key",
              "Content-Type": "application/json",
            }),
            body: expect.stringContaining('"model":"nano-banana"'),
          }),
        );
      });

      it("should include correct prompt in request", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "Custom prompt for image generation",
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            created: Date.now(),
            data: [{ url: "https://example.com/image.jpg" }],
            usage: {
              input_tokens: 100,
              input_tokens_details: { image_tokens: 0, text_tokens: 100 },
              output_tokens: 50,
              total_tokens: 150,
            },
          }),
          status: 200,
        } as Response);

        await provider.createGeneration(input);

        expect(mockFetch).toHaveBeenCalledWith(
          "https://api.gpt.ge/v1/images/generations",
          expect.objectContaining({
            body: expect.stringContaining('"prompt":"Custom prompt for image generation"'),
          }),
        );
      });

      it("should use default prompt when not provided", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            created: Date.now(),
            data: [{ url: "https://example.com/image.jpg" }],
            usage: {
              input_tokens: 100,
              input_tokens_details: { image_tokens: 0, text_tokens: 100 },
              output_tokens: 50,
              total_tokens: 150,
            },
          }),
          status: 200,
        } as Response);

        await provider.createGeneration(input);

        expect(mockFetch).toHaveBeenCalledWith(
          "https://api.gpt.ge/v1/images/generations",
          expect.objectContaining({
            body: expect.stringContaining('"prompt":"Generate a professional headshot photo"'),
          }),
        );
      });

      it("should use custom size from extra parameters", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
          extra: { size: "2:3" },
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            created: Date.now(),
            data: [{ url: "https://example.com/image.jpg" }],
            usage: {
              input_tokens: 100,
              input_tokens_details: { image_tokens: 0, text_tokens: 100 },
              output_tokens: 50,
              total_tokens: 150,
            },
          }),
          status: 200,
        } as Response);

        await provider.createGeneration(input);

        expect(mockFetch).toHaveBeenCalledWith(
          "https://api.gpt.ge/v1/images/generations",
          expect.objectContaining({
            body: expect.stringContaining('"size":"2:3"'),
          }),
        );
      });

      it("should use url response format", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            created: Date.now(),
            data: [{ url: "https://example.com/image.jpg" }],
            usage: {
              input_tokens: 100,
              input_tokens_details: { image_tokens: 0, text_tokens: 100 },
              output_tokens: 50,
              total_tokens: 150,
            },
          }),
          status: 200,
        } as Response);

        await provider.createGeneration(input);

        expect(mockFetch).toHaveBeenCalledWith(
          "https://api.gpt.ge/v1/images/generations",
          expect.objectContaining({
            body: expect.stringContaining('"response_format":"url"'),
          }),
        );
      });

      it("should include correct User-Agent header", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            created: Date.now(),
            data: [{ url: "https://example.com/image.jpg" }],
            usage: {
              input_tokens: 100,
              input_tokens_details: { image_tokens: 0, text_tokens: 100 },
              output_tokens: 50,
              total_tokens: 150,
            },
          }),
          status: 200,
        } as Response);

        await provider.createGeneration(input);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              "User-Agent": "HeadshotPro-AI/1.0",
            }),
          }),
        );
      });
    });

    describe("error handling", () => {
      it("should handle 401 Unauthorized errors", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          json: async () => ({
            error: { message: "Invalid API key", type: "authentication_error" },
          }),
        } as Response);

        const { jobId } = await provider.createGeneration(input);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const result = await provider.getGenerationStatus(jobId);

        expect(result.status).toBe("failed");
        expect(result.error).toBe("Invalid API key");
      });

      it("should handle 429 Rate limit errors", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        mockFetch.mockResolvedValue({
          ok: false,
          status: 429,
          json: async () => ({
            error: { message: "Rate limit exceeded", type: "rate_limit_error" },
          }),
        } as Response);

        const { jobId } = await provider.createGeneration(input);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const result = await provider.getGenerationStatus(jobId);

        expect(result.status).toBe("failed");
        expect(result.error).toBe("Rate limit exceeded");
      });

      it("should handle empty data array response", async () => {
        const input = {
          styleId: "professional",
          userId: "user_123",
          prompt: "A professional headshot photo",
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            created: Date.now(),
            data: [],
            usage: {
              input_tokens: 100,
              input_tokens_details: { image_tokens: 0, text_tokens: 100 },
              output_tokens: 50,
              total_tokens: 150,
            },
          }),
          status: 200,
        } as Response);

        const { jobId } = await provider.createGeneration(input);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const result = await provider.getGenerationStatus(jobId);

        expect(result.status).toBe("failed");
        expect(result.error).toBe("No image data in response");
      });
    });
  });
});
