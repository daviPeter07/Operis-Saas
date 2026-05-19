import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ReportSummaryCard = {
    title: string;
    value: string;
};

type ReportSummaryCardsProps = {
    cards: ReportSummaryCard[];
};

export function ReportSummaryCards({ cards }: ReportSummaryCardsProps) {
    if (cards.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, index) => (
                <Card
                    key={card.title}
                    className={cn(
                        'overflow-hidden border-border bg-card shadow-sm',
                        'transition-shadow hover:shadow-md',
                    )}
                >
                    <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </p>
                            <p className="text-2xl leading-none font-black tracking-tight text-foreground">
                                {card.value}
                            </p>
                        </div>

                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full ring-1',
                                index % 4 === 0
                                    ? 'bg-orange-500/15 text-orange-500 ring-orange-500/25'
                                    : index % 4 === 1
                                      ? 'bg-emerald-500/15 text-emerald-500 ring-emerald-500/25'
                                      : index % 4 === 2
                                        ? 'bg-sky-500/15 text-sky-500 ring-sky-500/25'
                                        : 'bg-violet-500/15 text-violet-500 ring-violet-500/25',
                            )}
                        >
                            <BarChart3 className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
