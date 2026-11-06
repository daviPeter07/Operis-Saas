import { DetailsCard } from '@/components/details-page';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrencyBR } from '@/lib/format';
import { getSaleItemName, isServiceItem } from '@/utils/sale-items';
import type { SaleItemsProps } from '../../utils/types';

export function SaleItems({ sale }: SaleItemsProps) {
    const items = sale.items ?? [];

    return (
        <DetailsCard title="Itens">
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Nenhum item nesta venda.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead className="text-right">
                                    Qtd.
                                </TableHead>
                                <TableHead className="text-right">
                                    Preço unit.
                                </TableHead>
                                <TableHead className="text-right">
                                    Subtotal
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <span className="inline-flex flex-wrap items-center gap-2">
                                            {getSaleItemName(item)}
                                            {isServiceItem(item) ? (
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                    Serviço
                                                </span>
                                            ) : null}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {item.category_name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {item.brand_name || '-'}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {item.quantity}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {formatCurrencyBR(item.unit_price)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium tabular-nums">
                                        {formatCurrencyBR(item.subtotal)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </DetailsCard>
    );
}
