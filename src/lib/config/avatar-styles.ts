import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Shirt,
  Crown,
  Sparkles,
  Cpu,
  Linkedin,
} from "lucide-react";

/**
 * 定义头像风格的类型
 */
export interface AvatarStyle {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  aiPrompt: string;
  category: "business" | "professional" | "creative";
  icon: LucideIcon;
  gradient: string;
  badgeColor: string;
}

/**
 * 可用的头像风格配置
 */
export const AVATAR_STYLES: AvatarStyle[] = [
  {
    id: "business-suit",
    name: "Business Suit",
    description: "Professional business attire with formal suit and tie",
    previewImage: "/images/styles/business-suit.jpg",
    aiPrompt:
      "Transform this photo into a professional business headshot with the person wearing a formal business suit and tie. Keep the person's face, features and likeness identical to the original. Use studio lighting and clean professional background. Corporate portrait style, high quality.",
    category: "business",
    icon: Briefcase,
    gradient: "linear-gradient(135deg, rgb(59 130 246 / 0.2), rgb(71 85 105 / 0.3))",
    badgeColor: "text-blue-600",
  },
  {
    id: "business-casual",
    name: "Business Casual",
    description: "Smart casual business look with blazer",
    previewImage: "/images/styles/business-casual.jpg",
    aiPrompt:
      "Transform this photo into a professional headshot with the person wearing business casual attire and blazer. Keep the person's face, features and likeness identical to the original. Use studio lighting and clean modern background. Contemporary corporate portrait style, high quality.",
    category: "business",
    icon: Shirt,
    gradient: "linear-gradient(135deg, rgb(6 182 212 / 0.2), rgb(13 148 136 / 0.3))",
    badgeColor: "text-cyan-600",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Executive-level professional with premium background",
    previewImage: "/images/styles/executive.jpg",
    aiPrompt:
      "Transform this photo into an executive portrait with the person in premium business attire. Keep the person's face, features and likeness identical to the original. Use elegant lighting and sophisticated professional background. Executive presence, high-end corporate photography style, high quality.",
    category: "professional",
    icon: Crown,
    gradient: "linear-gradient(135deg, rgb(245 158 11 / 0.2), rgb(234 88 12 / 0.3))",
    badgeColor: "text-amber-600",
  },
  {
    id: "creative-casual",
    name: "Creative Casual",
    description: "Modern creative professional look",
    previewImage: "/images/styles/creative-casual.jpg",
    aiPrompt:
      "Transform this photo into a modern creative professional headshot with the person wearing stylish casual attire. Keep the person's face, features and likeness identical to the original. Use natural lighting and contemporary background. Creative industry look, high quality.",
    category: "creative",
    icon: Sparkles,
    gradient: "linear-gradient(135deg, rgb(168 85 247 / 0.2), rgb(219 39 119 / 0.3))",
    badgeColor: "text-purple-600",
  },
  {
    id: "tech-startup",
    name: "Tech Startup",
    description: "Modern tech startup founder style",
    previewImage: "/images/styles/tech-startup.jpg",
    aiPrompt:
      "Transform this photo into a tech startup founder headshot with modern professional look. Keep the person's face, features and likeness identical to the original. Use clean minimalist background. Tech industry style, approachable yet professional, high quality.",
    category: "professional",
    icon: Cpu,
    gradient: "linear-gradient(135deg, rgb(99 102 241 / 0.2), rgb(139 92 246 / 0.3))",
    badgeColor: "text-indigo-600",
  },
  {
    id: "linkedin-professional",
    name: "LinkedIn Pro",
    description: "Optimized for LinkedIn profile pictures",
    previewImage: "/images/styles/linkedin.jpg",
    aiPrompt:
      "Transform this photo into a LinkedIn professional headshot perfect for business networking. Keep the person's face, features and likeness identical to the original. Use studio lighting with friendly yet professional expression. Optimal LinkedIn profile style, high quality.",
    category: "business",
    icon: Linkedin,
    gradient: "linear-gradient(135deg, rgb(37 99 235 / 0.2), rgb(30 58 138 / 0.3))",
    badgeColor: "text-blue-700",
  },
];

/**
 * 风格分类
 */
export const STYLE_CATEGORIES = [
  { id: "all", label: "All Styles" },
  { id: "business", label: "Business" },
  { id: "professional", label: "Professional" },
  { id: "creative", label: "Creative" },
] as const;

/**
 * 根据 ID 获取风格
 */
export function getStyleById(id: string): AvatarStyle | undefined {
  return AVATAR_STYLES.find((style) => style.id === id);
}

/**
 * 根据分类筛选风格
 */
export function getStylesByCategory(
  category: string,
): AvatarStyle[] {
  if (category === "all") return AVATAR_STYLES;
  return AVATAR_STYLES.filter((style) => style.category === category);
}
