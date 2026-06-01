import { Download, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    isWebSerialSupported,
    printSaleThermalReceiptWithWebSerial,
} from '@/lib/web-serial-printer';
import type { Sale } from '@/schemas/sale';
import type { ThermalPaperWidth } from '@/utils/sale-documents';
import {
    buildSaleDocumentPreviewHtml,
    downloadSaleInvoicePdf,
    printSaleThermalReceipt,
} from '@/utils/sale-documents';

type PreviewMode = 'digital' | 'thermal';

type SaleDocumentPreviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sale: Sale | null;
    initialMode?: PreviewMode;
};

export function SaleDocumentPreviewDialog({
    open,
    onOpenChange,
    sale,
    initialMode = 'digital',
}: SaleDocumentPreviewDialogProps) {
    const [mode, setMode] = useState<PreviewMode>(initialMode);
    const [paperWidth, setPaperWidth] = useState<ThermalPaperWidth>('58mm');

    const previewDocument = useMemo(() => {
        if (!sale) {
            return '';
        }

        return buildSaleDocumentPreviewHtml(sale, mode, paperWidth);
    }, [mode, paperWidth, sale]);

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen);

                if (nextOpen) {
                    setMode(initialMode);
                }
            }}
        >
            <DialogContent className="max-w-[min(1200px,calc(100vw-1rem))] p-0 sm:max-w-[min(1200px,calc(100vw-1rem))]">
                <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
                    <aside className="border-r bg-muted/20 p-5">
                        <DialogHeader className="mb-5 text-left">
                            <DialogTitle>Preview do comprovante</DialogTitle>
                            <DialogDescription>
                                Revise o documento antes de exportar ou
                                imprimir.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Visualizacao
                                </p>
                                <ToggleGroup
                                    type="single"
                                    value={mode}
                                    onValueChange={(value) => {
                                        if (
                                            value === 'digital' ||
                                            value === 'thermal'
                                        ) {
                                            setMode(value);
                                        }
                                    }}
                                    className="grid grid-cols-2 gap-2"
                                >
                                    <ToggleGroupItem
                                        value="digital"
                                        variant="outline"
                                        className="rounded-md border"
                                    >
                                        Digital
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="thermal"
                                        variant="outline"
                                        className="rounded-md border"
                                    >
                                        Termica
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                            {mode === 'thermal' ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        Largura do papel
                                    </p>
                                    <ToggleGroup
                                        type="single"
                                        value={paperWidth}
                                        onValueChange={(value) => {
                                            if (
                                                value === '58mm' ||
                                                value === '80mm'
                                            ) {
                                                setPaperWidth(value);
                                            }
                                        }}
                                        className="grid grid-cols-2 gap-2"
                                    >
                                        <ToggleGroupItem
                                            value="58mm"
                                            variant="outline"
                                            className="rounded-md border"
                                        >
                                            58 mm
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="80mm"
                                            variant="outline"
                                            className="rounded-md border"
                                        >
                                            80 mm
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </div>
                            ) : null}
                        </div>
                    </aside>

                    <section className="flex min-h-[80dvh] flex-col">
                        <div className="flex-1 bg-muted/10 p-4">
                            {sale ? (
                                <iframe
                                    title="Preview do documento da venda"
                                    srcDoc={previewDocument}
                                    className="h-[72dvh] w-full rounded-md border bg-white"
                                />
                            ) : null}
                        </div>

                        <DialogFooter className="border-t px-4 py-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Fechar
                            </Button>
                            {mode === 'digital' ? (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (sale) {
                                            downloadSaleInvoicePdf(sale);
                                        }
                                    }}
                                >
                                    <Download className="h-4 w-4" />
                                    Baixar PDF
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={async () => {
                                        if (sale) {
                                            try {
                                                if (!isWebSerialSupported()) {
                                                    printSaleThermalReceipt(
                                                        sale,
                                                        paperWidth,
                                                    );
                                                    toast.success(
                                                        'Abrindo impressao do Windows com layout termico.',
                                                    );

                                                    return;
                                                }

                                                await printSaleThermalReceiptWithWebSerial(
                                                    sale,
                                                    paperWidth,
                                                );

                                                toast.success(
                                                    'Comprovante enviado para a impressora.',
                                                );
                                            } catch (error) {
                                                printSaleThermalReceipt(
                                                    sale,
                                                    paperWidth,
                                                );

                                                const message =
                                                    error instanceof Error
                                                        ? error.message
                                                        : 'Falha ao imprimir diretamente na termica.';

                                                toast.warning(
                                                    `${message} Abrindo impressao do Windows com layout termico.`,
                                                );
                                            }
                                        }
                                    }}
                                >
                                    <Printer className="h-4 w-4" />
                                    Imprimir
                                </Button>
                            )}
                        </DialogFooter>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
