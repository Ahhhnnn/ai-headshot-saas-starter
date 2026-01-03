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
      "Professional headshot of a person wearing a formal business suit, studio lighting, clean background, corporate portrait style, high quality, 4K",
    category: "business",
  },
  {
    id: "business-casual",
    name: "Business Casual",
    description: "Smart casual business look with blazer",
    previewImage: "/images/styles/business-casual.jpg",
    aiPrompt:
      "Professional headshot of a person wearing business casual attire, blazer, studio lighting, clean background, modern corporate portrait, high quality, 4K",
    category: "business",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Executive-level professional with premium background",
    previewImage: "/images/styles/executive.jpg",
    aiPrompt:
      "Executive portrait of a person, premium business setting, elegant lighting, sophisticated background, executive presence, professional corporate photography, high quality, 4K",
    category: "professional",
  },
  {
    id: "creative-casual",
    name: "Creative Casual",
    description: "Modern creative professional look",
    previewImage: "/images/styles/creative-casual.jpg",
    aiPrompt:
      "Modern headshot of a creative professional, stylish casual attire, natural lighting, contemporary background, creative industry look, high quality, 4K",
    category: "creative",
  },
  {
    id: "tech-startup",
    name: "Tech Startup",
    description: "Modern tech startup founder style",
    previewImage: "/images/styles/tech-startup.jpg",
    aiPrompt:
      "Tech startup founder headshot, modern professional look, clean minimalist background, tech industry style, approachable yet professional, high quality, 4K",
    category: "professional",
  },
  {
    id: "linkedin-professional",
    name: "LinkedIn Pro",
    description: "Optimized for LinkedIn profile pictures",
    previewImage: "/images/styles/linkedin.jpg",
    aiPrompt:
      "LinkedIn professional headshot, perfect for business networking, friendly yet professional expression, studio lighting, optimal LinkedIn crop, high quality, 4K",
    category: "business",
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
