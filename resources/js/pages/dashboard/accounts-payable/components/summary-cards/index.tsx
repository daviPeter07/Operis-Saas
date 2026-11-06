import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SUMMARY_CARDS } from '../../utils/constants';
import { getPayablesTotals, usePayablesSummary } from '../../utils/functions';
import type { SummaryCardsProps } from '../../utils/types';

export function SummaryCards({ apiParams }: SummaryCardsProps) {
    const { data: payables, isPending } = usePayablesSummary(apiParams);
    const totals = getPayablesTotals(payables ?? []);

    return (
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            {SUMMARY_CARDS.map(({ key, label, icon: Icon, format }) => (
                <Card
                    key={key}
                    className="overflow-hidden border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                    <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                {label}
                            </p>
                            {isPending ? (
                                <Skeleton className="h-6 w-28" />
                            ) : (
                                <p className="text-2xl leading-none font-black tracking-tight text-foreground">
                                    {format(totals[key])}
                                </p>
                            )}
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/25">
                            <Icon className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
