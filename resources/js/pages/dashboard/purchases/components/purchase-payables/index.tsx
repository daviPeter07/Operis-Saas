import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '@/components/common/status-badge';
import { DetailsCard } from '@/components/details-page';
import { RecordLink } from '@/components/table/record-link';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { withAppBasePath } from '@/constants/workspace';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { formatPaidAt } from '../../utils/functions';
import type { PurchasePayablesProps } from '../../utils/types';

export function PurchasePayables({
    purchaseId,
    payables,
}: PurchasePayablesProps) {
    return (
        <DetailsCard
            title="Contas a pagar"
            action={
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <Link
                        href={withAppBasePath(
                            `/dashboard/accounts-payable?purchase=${purchaseId}`,
                        )}
                    >
                        Ver em contas a pagar
                        <ArrowUpRight className="size-4" />
                    </Link>
                </Button>
            }
        >
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Parcela</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-right">Pago</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Pago em</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payables.map((payable) => (
                            <TableRow key={payable.id}>
                                <TableCell className="font-medium">
                                    <RecordLink
                                        href={withAppBasePath(
                                            `/dashboard/accounts-payable/${payable.id}`,
                                        )}
                                    >
                                        {payable.total_installments
                                            ? `${payable.installment_number}/${payable.total_installments}`
                                            : 'Única'}
                                    </RecordLink>
                                </TableCell>
                                <TableCell>
                                    {payable.due_date
                                        ? formatDateBR(payable.due_date)
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatCurrencyBR(payable.amount)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatCurrencyBR(payable.amount_paid)}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={payable.status} />
                                </TableCell>
                                <TableCell>
                                    {formatPaidAt(payable.paid_at)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </DetailsCard>
    );
}
