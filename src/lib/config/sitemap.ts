export interface StaticPageConfig {
  path: string;
  priority: number;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  images?: string[];
}

export const STATIC_PAGES: StaticPageConfig[] = [
  {
    path: "",
    priority: 1.0,
    changeFrequency: "weekly",
    images: ["/og.png", "/images/hero/hero.jpeg", "/logo.png"],
  },
  {
    path: "/generator",
    priority: 0.9,
    changeFrequency: "weekly",
  },
  {
    path: "/blog",
    priority: 0.9,
    changeFrequency: "daily",
  },
  {
    path: "/pricing",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/about",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/contact",
    priority: 0.6,
    changeFrequency: "yearly",
  },
  {
    path: "/privacy",
    priority: 0.3,
    changeFrequency: "yearly",
  },
  {
    path: "/terms",
    priority: 0.3,
    changeFrequency: "yearly",
  },
];
