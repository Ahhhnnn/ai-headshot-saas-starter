import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

type LogoVariant = "default" | "minimal" | "icon-only";

interface LogoProps {
  className?: string;
  variant?: LogoVariant;
  iconClassName?: string;
}

export function Logo({
  className,
  variant = "icon-only",
  iconClassName,
}: LogoProps) {
  const baseClasses = "flex items-center justify-center";

  const variantClasses = {
    default: "h-full w-full rounded-lg bg-primary p-1.5",
    minimal: "h-full w-full rounded-md bg-primary/10 p-1",
    "icon-only": "h-full w-full",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={192}
        height={192}
        className={cn("h-full w-full", iconClassName)}
        priority
      />
    </div>
  );
}
