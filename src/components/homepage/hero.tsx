"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star } from "lucide-react";
import Link from "next/link";

const heroImage = "/images/hero/hero.jpeg";

export function Hero() {
  return (
    <section className="relative pt-20 pb-20 lg:pt-28 lg:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span data-lingo-skip>New: Team plans now available</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
              Get your professional LinkedIn headshots in{" "}
              <span className="text-primary">minutes</span>, not hours.
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Professional AI-generated headshots at 1/10th the cost of a photo studio.
              Upload a few selfies and get 50+ stunning professional headshots in under an hour.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" asChild>
                <Link href="/generator">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="heroGhost"
                size="xl"
                onClick={() => document.getElementById("samples")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Play className="w-5 h-5" />
                View Samples
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground">5+</span>
                <span className="text-muted-foreground"> professionals trust us</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Professional AI-generated headshots"
                className="w-full h-auto"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>

            {/* Floating cards */}
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-4 shadow-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Ready in 30 min</p>
                  <p className="text-xs text-muted-foreground">50+ headshots delivered</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-card rounded-xl p-4 shadow-xl border border-border">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">4.9/5</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">From 5+ reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
