/**
 * 定义产品特性
 */
export interface ProductFeature {
  name: string;
  included: boolean;
  description?: string;
}

/**
 * 定义一次性购买获得的积分
 */
export interface TierCredits {
  oneTime: number; // 一次性购买获得的积分数量
}

/**
 * 定义一个定价套餐
 */
export interface PricingTier {
  id: string; // 我们系统内部的套餐 ID，如 'free', 'pro', 'enterprise'
  name: string;
  description: string;
  isPopular: boolean;
  features: ProductFeature[];
  pricing: {
    // 针对不同支付提供商的产品ID
    creem: {
      oneTime: string;
      monthly: string;
      yearly: string;
    };
    // stripe: { ... }; // 为未来扩展预留
  };
  prices: {
    oneTime: number;
    monthly: number;
    yearly: number;
  };
  credits?: TierCredits; // 一次性购买获得的积分
  currency: "USD" | "EUR"; // 支持的货币
}

/**
 * 统一定义所有产品套餐
 * 每个计费模式 (one_time, monthly, yearly) 都需要一个唯一的产品ID。
 */
export const PRODUCT_TIERS: PricingTier[] = [
  {
    id: "trialer",
    name: "Trialer",
    description: "Try before you commit",
    isPopular: false,
    features: [
      { name: "2 professional headshots", included: true },
      { name: "1 background style", included: true },
      { name: "48-hour delivery", included: true },
      { name: "Basic retouching", included: true },
      { name: "One-time purchase only", included: true },
    ],
    pricing: {
      creem: {
        oneTime: "prod_2g4rjo9C62coHG16jrie6",
        monthly: "",
        yearly: "",
      },
    },
    prices: {
      oneTime: 1,
      monthly: 0,
      yearly: 0,
    },
    credits: {
      oneTime: 2, // $0.09 = 2 credits
    },
    currency: "USD",
  },
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for trying out",
    isPopular: false,
    features: [
      { name: "5 professional headshots", included: true },
      { name: "3 background styles", included: true },
      { name: "48-hour delivery", included: true },
      { name: "Basic retouching", included: true },
      // { name: "Advanced analytics", included: true },
      // { name: "Priority support", included: true },
      // { name: "10GB storage", included: false },
      // { name: "Team collaboration", included: false },
      // { name: "API access", included: false },
    ],
    pricing: {
      creem: {
        oneTime: "prod_4MJUT4Hc1kW2Nq6oIKz3os",
        monthly: "",
        yearly: "",
      },
    },
    prices: {
      oneTime: 4.9,
      monthly: 0,
      yearly: 0,
    },
    credits: {
      oneTime: 5, // $4.9 = 5 credits
    },
    currency: "USD",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Best for professionals",
    isPopular: true,
    features: [
      { name: "10 professional headshots", included: true },
      { name: "10 background styles", included: true },
      { name: "1-hour delivery", included: true },
      { name: "Advanced retouching", included: true },
      { name: "LinkedIn optimization", included: true },
      { name: "Priority support", included: true },
      // { name: "10GB storage", included: true },
      // { name: "Team collaboration", included: true },
      // { name: "API access", included: true },
      // { name: "Dedicated support", included: false },
    ],
    pricing: {
      creem: {
        oneTime: "prod_6yroK3rnaFHSZoDcCMzJWp",
        monthly: "",
        yearly: "",
      },
    },
    prices: {
      oneTime: 9.9,
      monthly: 0,
      yearly: 0,
    },
    credits: {
      oneTime: 20, // $9.9 = 20 credits
    },
    currency: "USD",
  },
  // Team tier commented out - temporarily unavailable
  /*
  {
    id: "team",
    name: "Team",
    description: "For teams and companies",
    isPopular: false,
    features: [
      { name: "60 headshots (up to 5 people)", included: true },
      { name: "Unlimited backgrounds", included: true },
      { name: "30-minute delivery", included: true },
      { name: "Premium retouching", included: true },
      { name: "Brand consistency", included: true },
      { name: "Dedicated account manager", included: true },
    ],
    pricing: {
      creem: {
        oneTime: "prod_team_one_time",
        monthly: "prod_team_monthly",
        yearly: "prod_team_yearly",
      },
    },
    prices: {
      oneTime: 59.9,
      monthly: 0,
      yearly: 0,
    },
    credits: {
      oneTime: 60,
    },
    currency: "USD",
  },
  */
  // Legacy tiers kept for reference, can be removed later
  /*
  {
    id: "plus",
    name: "Plus",
    description: "Best for growing teams and businesses",
    isPopular: false,
    features: [],
    pricing: {
      creem: {
        oneTime: "prod_6mYAPTGcXZrU1XrPRXfleP",
        monthly: "prod_6uhcfBUcRxprqDvep0U5Jw",
        yearly: "prod_7LJkGVgv4LOBuucrxANo2b",
      },
    },
    prices: {
      oneTime: 19.99,
      monthly: 9.99,
      yearly: 99.99,
    },
    credits: {
      oneTime: 10,
    },
    currency: "USD",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Best for growing teams and businesses",
    isPopular: true,
    features: [],
    pricing: {
      creem: {
        oneTime: "prod_6uhcfBUcRxprqDvep0U5Jw",
        monthly: "prod_6uhcfBUcRxprqDvep0U5Jw",
        yearly: "prod_6uhcfBUcRxprqDvep0U5Jw",
      },
    },
    prices: {
      oneTime: 29.99,
      monthly: 19.99,
      yearly: 199.99,
    },
    credits: {
      oneTime: 15,
    },
    currency: "USD",
  },
  */
];

/**
 * 根据内部套餐 ID 获取套餐详情
 * @param id - 套餐 ID ('pro', 'enterprise'等)
 * @returns PricingTier | undefined
 */
export const getProductTierById = (id: string): PricingTier | undefined => {
  return PRODUCT_TIERS.find((tier) => tier.id === id);
};

/**
 * 根据支付提供商的产品ID反查套餐详情
 * @param productId - 支付提供商的产品 ID
 * @returns PricingTier | undefined
 */
export const getProductTierByProductId = (
  productId: string,
): PricingTier | undefined => {
  for (const tier of PRODUCT_TIERS) {
    if (Object.values(tier.pricing.creem).includes(productId)) {
      return tier;
    }
  }
  return undefined;
};
