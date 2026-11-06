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
import type { ThermalPaperWidth } from '@/utils/sale-documents';
import {
    buildSaleDocumentPreviewHtml,
    downloadSaleInvoicePdf,
    printSaleThermalReceipt,
} from '@/utils/sale-documents';
import type {
    PrintPreviewDialogProps,
    PrintPreviewMode,
} from '../../utils/types';

export function PrintPreviewDialog({
    open,
    onOpenChange,
    sale,
    initialMode = 'digital',
}: PrintPreviewDialogProps) {
    const [mode, setMode] = useState<PrintPreviewMode>(initialMode);
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
            <DialogContent className="flex h-[calc(100dvh-1rem)] max-w-[min(1200px,calc(100vw-1rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(1200px,calc(100vw-1rem))] lg:h-[min(92dvh,960px)]">
                <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] lg:grid-rows-1">
                    <aside className="border-b bg-muted/20 p-4 pr-12 lg:border-r lg:border-b-0 lg:p-5">
                        <DialogHeader className="mb-4 text-left lg:mb-5">
                            <DialogTitle>Comprovante da venda</DialogTitle>
                            <DialogDescription className="hidden sm:block">
                                Revise o documento antes de baixar ou imprimir.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Visualização
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
                                        Térmica
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

                    <section className="flex min-h-0 flex-col">
                        <div className="min-h-0 flex-1 bg-muted/10 p-2 sm:p-4">
                            {sale ? (
                                <iframe
                                    title="Preview do documento da venda"
                                    srcDoc={previewDocument}
                                    className="h-full w-full rounded-md border bg-white"
                                />
                            ) : null}
                        </div>

                        <DialogFooter className="flex-row gap-2 border-t px-4 py-3 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 sm:flex-none"
                                onClick={() => onOpenChange(false)}
                            >
                                Fechar
                            </Button>
                            {mode === 'digital' ? (
                                <Button
                                    type="button"
                                    className="flex-1 sm:flex-none"
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
                                    className="flex-1 sm:flex-none"
                                    onClick={async () => {
                                        if (sale) {
                                            try {
                                                if (!isWebSerialSupported()) {
                                                    printSaleThermalReceipt(
                                                        sale,
                                                        paperWidth,
                                                    );
                                                    toast.success(
                                                        'Abrindo a impressão do Windows com layout térmico.',
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
                                                        : 'Falha ao imprimir diretamente na térmica.';

                                                toast.warning(
                                                    `${message} Abrindo a impressão do Windows com layout térmico.`,
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
