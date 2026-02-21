import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AdminDashboardSkeleton() {
    return (
        <div className="space-y-10">
            <div className="space-y-2">
                <Skeleton className="h-10 w-64 rounded-xl" />
                <Skeleton className="h-4 w-96 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="border-white/5 bg-card/40">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between mb-2">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-8 w-16 rounded-lg" />
                            <Skeleton className="h-3 w-24 rounded-lg mt-2" />
                        </CardHeader>
                        <div className="h-1.5 w-full bg-white/5">
                            <Skeleton className="h-full w-2/3" />
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 border-white/5 bg-card/40">
                    <CardHeader>
                        <Skeleton className="h-6 w-32 rounded-lg" />
                        <Skeleton className="h-4 w-64 rounded-lg mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 items-start pb-6 border-b border-white/5 last:border-0 last:pb-0">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full rounded-lg" />
                                    <Skeleton className="h-3 w-24 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-4 border-white/5 bg-card/40">
                    <CardHeader>
                        <Skeleton className="h-6 w-32 rounded-lg" />
                        <Skeleton className="h-4 w-48 rounded-lg mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24 rounded-lg" />
                                <Skeleton className="h-4 w-20 rounded-lg" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export function AdminFormSkeleton() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
            <Card className="border-white/5 bg-card/40">
                <CardContent className="p-8 space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24 rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    ))}
                    <Skeleton className="h-12 w-full rounded-xl mt-8" />
                </CardContent>
            </Card>
        </div>
    );
}
