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
import type { PurchaseItemsProps } from '../../utils/types';

export function PurchaseItems({ purchase }: PurchaseItemsProps) {
    const items = purchase.items ?? [];

    return (
        <DetailsCard title="Itens">
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Nenhum item nesta compra.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead className="text-right">
                                    Qtd.
                                </TableHead>
                                <TableHead className="text-right">
                                    Custo unit.
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
                                        {item.product_name ??
                                            `#${item.product_id}`}
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
                                        {formatCurrencyBR(item.unit_cost)}
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
