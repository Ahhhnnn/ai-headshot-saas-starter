import { headers } from "next/headers";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GeneratorClient } from "./_components/generator-client";
import { auth } from "@/lib/auth/server";

export default async function GeneratorPage() {
  // 检查登录状态
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return <UnauthenticatedView />;
  }

  return <GeneratorClient userId={session.user.id} />;
}

function UnauthenticatedView() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Sign in to Generate Headshots
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Create professional AI-generated headshots in minutes. Sign in to
          get started.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="hero" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="lg" variant="heroGhost" asChild>
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
