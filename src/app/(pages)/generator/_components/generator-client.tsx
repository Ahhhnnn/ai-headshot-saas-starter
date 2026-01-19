"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AVATAR_STYLES } from "@/lib/config/avatar-styles";
import {
  Upload,
  Wand2,
  Download,
  RefreshCw,
  Check,
  Loader2,
  Sparkles,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import { generateAvatar, getGenerationStatus } from "@/lib/actions/generate";
import { FileUploader, type UploadedFile } from "@/components/ui/file-uploader";

// 生成步骤
const GENERATION_STEPS = [
  { id: "upload", label: "Upload Photo" },
  { id: "select-style", label: "Select Style" },
  { id: "generate", label: "Generate" },
  { id: "download", label: "Download" },
];

interface GenerationResult {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl?: string;
  error?: string;
}

interface GeneratorClientProps {
  userId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function GeneratorClient({ userId: _userId }: GeneratorClientProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generationResult, setGenerationResult] =
    useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [creditBalance, setCreditBalance] = useState<number>(0);

  // Fetch credit balance on mount
  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch("/api/credits");
      if (response.ok) {
        const data = await response.json();
        setCreditBalance(data.credits?.balance ?? 0);
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // 处理风格选择
  const handleStyleSelect = useCallback((styleId: string) => {
    setSelectedStyle(styleId);
    toast.success("Style selected!");
  }, []);

  // 开始生成
  const handleGenerate = useCallback(async () => {
    if (!uploadedFile || !selectedStyle) {
      toast.error("Please upload a photo and select a style first.");
      return;
    }

    // 校验积分
    if (creditBalance < 1) {
      toast.error("Insufficient credits. Please purchase more credits to continue.");
      return;
    }

    setIsGenerating(true);
    setCurrentStep(2);
    setGenerationProgress(0);

    try {
      const result = await generateAvatar({
        inputImageUrl: uploadedFile.url,
        styleId: selectedStyle,
      });

      if (!result.success) {
        throw new Error(result.error || "Generation failed");
      }

      // 客户端轮询生成状态
      const pollInterval = 5000; // 5 seconds
      const maxAttempts = 20;
      let attempt = 0;

      const poll = async (): Promise<void> => {
        if (attempt >= maxAttempts) {
          throw new Error("Timeout waiting for generation");
        }

        const status = await getGenerationStatus(result.jobId!);

        // 更新进度
        const progress = Math.min(Math.round((attempt / maxAttempts) * 100), 95);
        setGenerationProgress(progress);

        if (status.status === "completed" && status.imageUrl) {
          setGenerationResult({
            id: status.id,
            status: "completed",
            imageUrl: status.imageUrl,
          });
          setCurrentStep(3);
          toast.success("Headshot generated successfully!");
          fetchCredits(); // Refresh credit balance
          return;
        }

        if (status.status === "failed") {
          throw new Error(status.error || "Generation failed");
        }

        // 继续轮询
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        await poll();
      };

      await poll();
    } catch (error) {
      console.error("Generation error:", error);
      setGenerationResult({
        id: "",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
      toast.error("Failed to generate headshot. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [uploadedFile, selectedStyle, fetchCredits]);

  // 重新开始
  const handleReset = useCallback(() => {
    setUploadedFile(null);
    setSelectedStyle(null);
    setGenerationResult(null);
    setGenerationProgress(0);
    setCurrentStep(0);
  }, []);

  // 下载图片
  const handleDownload = useCallback(async () => {
    if (!generationResult?.imageUrl) return;

    try {
      const response = await fetch(generationResult.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `headshot-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started!");
    } catch {
      toast.error("Failed to download image.");
    }
  }, [generationResult]);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          AI Headshot Generator
        </h1>
        <p className="text-muted-foreground mb-4">
          Upload your photo, select a style, and get professional headshots in
          minutes
        </p>
        {/* Credit Balance */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
            {creditBalance} credits remaining
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {GENERATION_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm hidden sm:inline",
                  index <= currentStep
                    ? "text-foreground font-medium"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              {index < GENERATION_STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-12 sm:w-24 h-0.5 mx-2 sm:mx-4",
                    index < currentStep ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Upload & Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Your Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploadedFile ? (
                <div className="relative">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={uploadedFile.url}
                      alt="Uploaded photo"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setUploadedFile(null)}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Change
                  </Button>
                </div>
              ) : (
                <FileUploader
                  acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
                  maxFileSize={10 * 1024 * 1024}
                  maxFiles={1}
                  onUploadComplete={(files) => {
                    if (files[0]) {
                      setUploadedFile(files[0]);
                      setCurrentStep(1);
                      toast.success("Photo uploaded successfully!");
                    }
                  }}
                  enableImageCompression={false}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Style Selection & Generate OR Result */}
        <div className="space-y-6">
          {generationResult?.status === "completed" && generationResult.imageUrl ? (
            /* Show Result - keep both images visible */
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Generated Headshot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={generationResult.imageUrl}
                      alt="Generated headshot"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Button className="flex-1" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Create Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Show Style Selection & Generate */
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Select Style
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedStyle || ""}
                    onValueChange={handleStyleSelect}
                    className="grid grid-cols-2 gap-4"
                  >
                    {AVATAR_STYLES.map((style) => (
                      <Label
                        key={style.id}
                        className={cn(
                          "cursor-pointer relative rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                          selectedStyle === style.id
                            ? "border-primary bg-primary/5"
                            : "border-border",
                        )}
                      >
                        <RadioGroupItem value={style.id} className="sr-only" />
                        <div className="aspect-video rounded-md overflow-hidden bg-muted mb-3">
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">
                              {style.name}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{style.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {style.description}
                          </p>
                        </div>
                        {selectedStyle === style.id && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="default" className="bg-primary">
                              <Check className="w-3 h-3 mr-1" />
                              Selected
                            </Badge>
                          </div>
                        )}
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {isGenerating ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="font-medium">
                            Generating your headshot...
                          </span>
                        </div>
                        <Progress value={generationProgress} className="h-2" />
                        <p className="text-center text-sm text-muted-foreground">
                          {generationProgress}% complete
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          size="lg"
                          className="w-full"
                          onClick={handleGenerate}
                          disabled={!uploadedFile || !selectedStyle || creditBalance < 1}
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Headshot
                        </Button>
                        {creditBalance < 1 ? (
                          <div className="flex items-center justify-center gap-1.5 text-xs text-destructive">
                            <span>No credits remaining</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span>Generates 1 headshot, costs 1 credit</span>
                          </div>
                        )}
                      </div>
                    )}

                    {generationResult?.status === "failed" && (
                      <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        <p className="font-medium">Generation failed</p>
                        <p>{generationResult.error}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
