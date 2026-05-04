import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface ImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (data: Record<string, unknown>[]) => void;
    maxRows?: number;
    acceptFormats?: string[];
    className?: string;
}

interface ParsedData {
    headers: string[];
    rows: Record<string, unknown>[];
    fileName: string;
    fileType: string;
}

export function ImportDialog({
    open,
    onOpenChange,
    onImport,
    maxRows = 1000,
    acceptFormats = ['.xlsx', '.xls', '.csv'],
    className,
}: ImportDialogProps) {
    const [, setFile] = React.useState<File | null>(null);
    const [parsedData, setParsedData] = React.useState<ParsedData | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        setError(null);
        setParsedData(null);
        setFile(selectedFile);

        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

        if (
            !fileExtension ||
            !acceptFormats.some((f) => f.includes(fileExtension))
        ) {
            setError(`Formato inválido. Aceitos: ${acceptFormats.join(', ')}`);

            return;
        }

        try {
            setIsProcessing(true);
            const data = await readFile(selectedFile);
            setParsedData(data);
        } catch (err) {
            setError(
                'Erro ao processar arquivo. Verifique se o formato está correto.',
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const readFile = async (file: File): Promise<ParsedData> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData =
                        XLSX.utils.sheet_to_json<Record<string, unknown>>(
                            worksheet,
                        );

                    if (jsonData.length === 0) {
                        reject(new Error('Arquivo vazio'));

                        return;
                    }

                    const headers = Object.keys(jsonData[0]);
                    const rows = jsonData.slice(0, maxRows);

                    resolve({
                        headers,
                        rows,
                        fileName: file.name,
                        fileType: fileExtension(file.name),
                    });
} catch (_err) {
                    reject(err);
                }
            };

            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));

            const fileExtension = (name: string) =>
                name.split('.').pop()?.toLowerCase() || '';
            const isCsv = fileExtension(file.name) === 'csv';

            if (isCsv) {
                reader.readAsText(file);
            } else {
                reader.readAsBinaryString(file);
            }
        });
    };

    const handleImport = () => {
        if (!parsedData || parsedData.rows.length === 0) {
            return;
        }

        onImport(parsedData.rows);
        toast.success(
            `${parsedData.rows.length} registros importados com sucesso`,
        );
        handleClose();
    };

    const handleClose = () => {
        setFile(null);
        setParsedData(null);
        setError(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={cn('sm:max-w-[700px]', className)}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Importar Dados
                    </DialogTitle>
                    <DialogDescription>
                        Selecione um arquivo Excel (.xlsx, .xls) ou CSV para
                        importar. Máximo {maxRows} linhas.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!parsedData ? (
                        <div className="space-y-2">
                            <Label htmlFor="file-upload">Arquivo</Label>
                            <Input
                                id="file-upload"
                                type="file"
                                accept={acceptFormats.join(',')}
                                onChange={handleFileChange}
                                disabled={isProcessing}
                            />
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            {isProcessing && (
                                <p className="text-sm text-muted-foreground">
                                    Processando arquivo...
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm">
                                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                    {parsedData.fileName}
                                </span>
                                <span className="text-muted-foreground">
                                    ({parsedData.rows.length} registros)
                                </span>
                            </div>

                            <div className="max-h-[300px] overflow-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {parsedData.headers
                                                .slice(0, 5)
                                                .map((header, i) => (
                                                    <TableHead
                                                        key={i}
                                                        className="text-xs"
                                                    >
                                                        {header}
                                                    </TableHead>
                                                ))}
                                            {parsedData.headers.length > 5 && (
                                                <TableHead className="text-xs text-muted-foreground">
                                                    +
                                                    {parsedData.headers.length -
                                                        5}{' '}
                                                    mais
                                                </TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedData.rows
                                            .slice(0, 5)
                                            .map((row, rowIndex) => (
                                                <TableRow key={rowIndex}>
                                                    {parsedData.headers
                                                        .slice(0, 5)
                                                        .map(
                                                            (
                                                                header,
                                                                cellIndex,
                                                            ) => (
                                                                <TableCell
                                                                    key={
                                                                        cellIndex
                                                                    }
                                                                    className="text-xs"
                                                                >
                                                                    {String(
                                                                        row[
                                                                            header
                                                                        ] ?? '',
                                                                    )}
                                                                </TableCell>
                                                            ),
                                                        )}
                                                    {parsedData.headers.length >
                                                        5 && (
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            ...
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {parsedData.rows.length > 5 && (
                                <p className="text-sm text-muted-foreground">
                                    Mostrando 5 de {parsedData.rows.length}{' '}
                                    linhas. Todas as linhas serão importadas.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        {parsedData ? 'Cancelar' : 'Fechar'}
                    </Button>
                    {parsedData && (
                        <Button onClick={handleImport}>
                            Importar {parsedData.rows.length} registros
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
