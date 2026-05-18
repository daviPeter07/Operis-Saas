import { Card, CardContent } from '@/components/ui/card';

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <Card
                    key={card.title}
                    className="border-border/60 bg-card/80 backdrop-blur-sm"
                >
                    <CardContent className="space-y-1 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {card.title}
                        </p>
                        <p
                            className={[
                                'text-xl font-semibold',
                                index % 4 === 0
                                    ? 'text-orange-600'
                                    : index % 4 === 1
                                      ? 'text-emerald-600'
                                      : index % 4 === 2
                                        ? 'text-sky-600'
                                        : 'text-violet-600',
                            ].join(' ')}
                        >
                            {card.value}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
