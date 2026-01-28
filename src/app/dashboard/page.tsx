import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { DashboardPageWrapper } from "./_components/dashboard-page-wrapper";
import { createMetadata } from "@/lib/metadata";
import { getUserCredits, getCreditHistory } from "@/lib/database/credits";
import {
  getUserGenerations,
  getGenerationCount,
} from "@/lib/database/generations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  Gift,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

export const metadata = createMetadata({
  title: "Dashboard",
  description: "Your AI HeadShot generations and credits",
});

export default async function DashboardPage() {
  // 获取会话
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    return (
      <DashboardPageWrapper title="Dashboard">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Please log in to view your dashboard</p>
        </div>
      </DashboardPageWrapper>
    );
  }

  // 并行获取所有数据
  const [credits, transactions, generations, totalCount] = await Promise.all([
    getUserCredits(session.user.id),
    getCreditHistory(session.user.id, 10),
    getUserGenerations(session.user.id, 8),
    getGenerationCount(session.user.id),
  ]);

  // 计算统计数据
  const balance = credits?.balance ?? 0;
  const completedCount = generations.filter(
    (g) => g.status === "completed",
  ).length;
  const processingCount = generations.filter(
    (g) => g.status === "processing" || g.status === "pending",
  ).length;

  // 获取用户显示名称
  const displayName = session.user.name ?? session.user.email?.split("@")[0] ?? "User";

  return (
    <DashboardPageWrapper title="Dashboard">
      {/* 欢迎面板 */}
      <div className="bg-card text-card-foreground mb-8 border shadow-sm">
        <div className="p-6">
          <h1 className="text-foreground mb-2 text-2xl font-bold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground">
            You have <span className="font-semibold text-foreground">{balance}</span> credits remaining
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
            <Coins className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-lingo-skip>
              {balance}
            </div>
            <p className="text-muted-foreground text-xs">
              Current balance
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated</CardTitle>
            <ImageIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-lingo-skip>
              {totalCount}
            </div>
            <p className="text-muted-foreground text-xs">
              Total generations
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-lingo-skip>
              {completedCount}
            </div>
            <p className="text-muted-foreground text-xs">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-lingo-skip>
              {processingCount}
            </div>
            <p className="text-muted-foreground text-xs">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 生成记录 */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-xl font-semibold">Recent Generations</h2>
            <p className="text-muted-foreground text-sm">
              Your latest AI headshot generations
            </p>
          </div>
          {/* <Link href="/dashboard/generations">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link> */}
        </div>

        {generations.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-6">
              <ImageIcon className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">No generations yet</h3>
              <p className="text-muted-foreground mb-4 text-center text-sm">
                Create your first AI headshot to see it here
              </p>
              <Link href="/generator">
                <Button>Create Headshot</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {generations.map((generation) => (
              <Card key={generation.id} className="shadow-sm overflow-hidden">
                <div className="bg-muted aspect-square relative flex items-center justify-center">
                  {generation.outputImageUrl ? (
                    <Image
                      src={generation.outputImageUrl}
                      alt={`Generation ${generation.id}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <ImageIcon className="text-muted-foreground h-12 w-12" />
                  )}
                  <div className="absolute right-2 top-2">
                    <GenerationStatusBadge status={generation.status} />
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(generation.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    {generation.styleId && (
                      <Badge variant="secondary" className="text-xs">
                        {generation.styleId}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 积分交易历史 */}
      <div>
        <div className="mb-4">
          <h2 className="text-foreground text-xl font-semibold">Credit History</h2>
          <p className="text-muted-foreground text-sm">
            Your recent credit transactions
          </p>
        </div>

        {transactions.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex min-h-[150px] flex-col items-center justify-center p-6">
              <Coins className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">No credit history</h3>
              <p className="text-muted-foreground text-center text-sm">
                Your credit transactions will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(transaction.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.type === "payment_refill" && transaction.description?.includes("Welcome") ? (
                          <Gift className="text-primary h-4 w-4" />
                        ) : transaction.amount > 0 ? (
                          <Plus className="text-emerald-600 h-4 w-4" />
                        ) : (
                          <Minus className="text-destructive h-4 w-4" />
                        )}
                        <span className="text-sm">{transaction.description ?? "Credit transaction"}</span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-mono text-sm font-medium ${
                      transaction.amount > 0
                        ? "text-emerald-600"
                        : "text-destructive"
                    }`} data-lingo-skip>
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </DashboardPageWrapper>
  );
}

// 生成状态徽章组件
function GenerationStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="bg-emerald-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Done
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 h-3 w-3 animate-pulse" />
          Processing
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">Failed</Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
