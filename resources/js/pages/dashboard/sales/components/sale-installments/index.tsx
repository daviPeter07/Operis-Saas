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
import {
    formatReceivedAt,
    getReceivableValue,
    getInstallmentLabel,
} from '../../utils/functions';
import type { SaleInstallmentsProps } from '../../utils/types';

export function SaleInstallments({
    saleId,
    receivables,
}: SaleInstallmentsProps) {
    const installmentsCount = receivables.filter(
        (receivable) => receivable.installment_number !== null,
    ).length;

    return (
        <DetailsCard
            title="Contas a receber"
            action={
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <Link
                        href={withAppBasePath(
                            `/dashboard/accounts-receivable?sale=${saleId}`,
                        )}
                    >
                        Ver em contas a receber
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
                            <TableHead>Status</TableHead>
                            <TableHead>Recebido em</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {receivables.map((receivable) => (
                            <TableRow key={receivable.id}>
                                <TableCell className="font-medium">
                                    <RecordLink
                                        href={withAppBasePath(
                                            `/dashboard/accounts-receivable/${receivable.id}`,
                                        )}
                                    >
                                        {getInstallmentLabel(
                                            receivable,
                                            installmentsCount,
                                        )}
                                    </RecordLink>
                                </TableCell>
                                <TableCell>
                                    {receivable.due_date
                                        ? formatDateBR(receivable.due_date)
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatCurrencyBR(
                                        getReceivableValue(receivable),
                                    )}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={receivable.status} />
                                </TableCell>
                                <TableCell>
                                    {formatReceivedAt(receivable.received_at)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </DetailsCard>
    );
}
