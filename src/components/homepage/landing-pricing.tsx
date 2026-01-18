"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Coins, CreditCard } from "lucide-react";
import { PRODUCT_TIERS, type PricingTier } from "@/lib/config/products";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Helper: Format Price
const formatPrice = (price: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
};

export function LandingPricing() {
  const popularTier = PRODUCT_TIERS.find((tier) => tier.isPopular);

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. All plans include a satisfaction guarantee.
          </p>
          {/* One-time payment indicator */}
          <div className="mt-4">
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-600 text-sm font-medium"
            >
              <CreditCard className="mr-1.5 h-4 w-4" />
              One-time payment with credits
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRODUCT_TIERS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative bg-card rounded-2xl p-8 border transition-all duration-300",
                plan.isPopular
                  ? "border-primary shadow-lg shadow-primary/10 scale-105"
                  : "border-border hover:border-primary/30"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {formatPrice(plan.prices.oneTime, plan.currency)}
                  </span>
                  <span className="text-muted-foreground">one-time</span>
                </div>
                {/* Credits badge */}
                {plan.credits?.oneTime && (
                  <div className="mt-3 flex justify-center">
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-amber-600 text-xs font-semibold"
                    >
                      <Coins className="mr-1.5 h-3 w-3" />
                      Get {plan.credits.oneTime} Credits
                    </Badge>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.isPopular ? "default" : "outline"}
                size="lg"
                asChild
              >
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
