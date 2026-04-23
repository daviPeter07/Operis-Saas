import { TrendingUp, ShoppingCart } from 'lucide-react';

interface ChartData {
    label: string;
    value: number;
}

interface ChartsPanelProps {
    revenueData: ChartData[];
    salesData: ChartData[];
}

export function ChartsPanel({ revenueData, salesData }: ChartsPanelProps) {
    const maxRevenue = Math.max(...revenueData.map((d) => d.value));
    const maxSales = Math.max(...salesData.map((d) => d.value));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold">Receita Mensal</h3>
                </div>
                <div className="flex items-end justify-between gap-2 h-40">
                    {revenueData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1">
                            <div
                                className="w-full bg-accent/20 rounded-t"
                                style={{
                                    height: `${(item.value / maxRevenue) * 100}%`,
                                    minHeight: '8px',
                                }}
                            />
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-2 mb-6">
                    <ShoppingCart className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold">Vendas Mensais</h3>
                </div>
                <div className="flex items-end justify-between gap-2 h-40">
                    {salesData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1">
                            <div
                                className="w-full bg-accent rounded-t"
                                style={{
                                    height: `${(item.value / maxSales) * 100}%`,
                                    minHeight: '8px',
                                }}
                            />
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}