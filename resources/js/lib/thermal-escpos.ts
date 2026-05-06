import {
    formatCurrencyBR,
    formatDateBR,
    translatePaymentMethod,
    translateStatus,
} from '@/lib/format';
import type { Sale } from '@/schemas/sale';
import type { ThermalPaperWidth } from '@/utils/sale-documents';

function sanitizeEscPosText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .replace(/[–—]/g, '-')
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function wrapReceiptText(value: string, width: number): string[] {
    const normalized = sanitizeEscPosText(value);

    if (!normalized) {
        return [''];
    }

    const words = normalized.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if (!currentLine) {
            currentLine = word;
            continue;
        }

        if (`${currentLine} ${word}`.length <= width) {
            currentLine = `${currentLine} ${word}`;
            continue;
        }

        lines.push(currentLine);
        currentLine = word;
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

function fitRight(left: string, right: string, width: number): string[] {
    const leftNormalized = sanitizeEscPosText(left);
    const rightNormalized = sanitizeEscPosText(right);
    const gap = width - leftNormalized.length - rightNormalized.length;

    if (gap >= 1) {
        return [`${leftNormalized}${' '.repeat(gap)}${rightNormalized}`];
    }

    const leftLines = wrapReceiptText(leftNormalized, width);
    const rightLines = wrapReceiptText(rightNormalized, width);

    return [...leftLines, ...rightLines];
}

function buildSeparator(width: number): string {
    return '-'.repeat(width);
}

function appendTextLines(
    lines: string[],
    content: string,
    width: number,
): void {
    lines.push(...wrapReceiptText(content, width).map((line) => `${line}\n`));
}

export function buildThermalEscPosLines(
    sale: Sale,
    paperWidth: ThermalPaperWidth,
): string[] {
    const width = paperWidth === '58mm' ? 32 : 42;
    const separator = buildSeparator(width);
    const customerName =
        sale.customer_name?.trim() || `Cliente #${sale.customer_id ?? '-'}`;
    const items = sale.items ?? [];
    const lines: string[] = [];
    const translatedStatus = translateStatus(sale.status);
    const translatedPaymentMethod = translatePaymentMethod(sale.payment_method);
    const categories = Array.from(
        new Set(
            items
                .map((item) => item.category_name?.trim())
                .filter((value): value is string => Boolean(value)),
        ),
    );

    lines.push('\x1B\x40');
    lines.push('\x1B\x74\x10');
    lines.push('\x1B\x61\x01');
    lines.push('Comprovante de venda\n');
    lines.push(`${separator}\n`);
    lines.push('\x1B\x61\x00');
    lines.push(
        ...fitRight(
            `Data: ${formatDateBR(sale.date)}`,
            `Venda: #${sale.id}`,
            width,
        ).map((line) => `${line}\n`),
    );
    lines.push('\x1B\x61\x01');
    lines.push(`${separator}\n`);
    lines.push('\x1B\x61\x00');
    lines.push('\x1B\x45\x01');
    lines.push('CLIENTE\n');
    lines.push('\x1B\x45\x00');
    appendTextLines(lines, customerName, width);
    lines.push('\n');
    lines.push('\x1B\x45\x01');
    lines.push('PRODUTOS\n');
    lines.push('\x1B\x45\x00');
    lines.push('\x1B\x61\x01');
    lines.push(`${separator}\n`);
    lines.push('\x1B\x61\x00');

    if (items.length === 0) {
        lines.push('Nenhum item encontrado\n');
    } else {
        for (const item of items) {
            const productName =
                item.product_name?.trim() || `Produto #${item.product_id}`;
            const categoryName = item.category_name?.trim();
            const quantityLine = `Qtd: ${item.quantity} x ${formatCurrencyBR(Number(item.unit_price))}`;
            const subtotalLine = `Subtotal: ${formatCurrencyBR(Number(item.subtotal))}`;

            lines.push('\x1B\x45\x01');
            appendTextLines(lines, productName, width);
            lines.push('\x1B\x45\x00');

            if (categoryName) {
                appendTextLines(lines, `Categoria: ${categoryName}`, width);
            }

            appendTextLines(lines, quantityLine, width);
            appendTextLines(lines, subtotalLine, width);
            lines.push(`${separator}\n`);
        }
    }

    lines.push('\x1B\x45\x01');
    lines.push('PAGAMENTO\n');
    lines.push('\x1B\x45\x00');
    lines.push('\x1B\x61\x01');
    lines.push(`${separator}\n`);
    lines.push('\x1B\x61\x00');
    appendTextLines(lines, translatedPaymentMethod, width);
    appendTextLines(lines, `Status: ${translatedStatus}`, width);

    if ((sale.installments ?? 1) > 1) {
        const installmentAmount = formatCurrencyBR(
            Number(sale.installment_value ?? sale.total),
        );
        const firstInstallmentDate = sale.first_installment_date
            ? formatDateBR(sale.first_installment_date)
            : formatDateBR(sale.date);

        appendTextLines(
            lines,
            `${sale.installments}x de ${installmentAmount} - primeira em ${firstInstallmentDate}`,
            width,
        );
    }

    appendTextLines(
        lines,
        `Categorias: ${categories.join(', ') || '-'}`,
        width,
    );
    lines.push('\x1B\x61\x01');
    lines.push(`${separator}\n`);
    lines.push('\x1B\x61\x00');
    lines.push('\x1B\x45\x01');
    lines.push('RESUMO\n');
    lines.push('\x1B\x45\x00');
    lines.push(
        ...fitRight(
            'Subtotal',
            formatCurrencyBR(Number(sale.subtotal)),
            width,
        ).map((line) => `${line}\n`),
    );
    lines.push('\x1B\x45\x01');
    lines.push(
        ...fitRight('Total', formatCurrencyBR(Number(sale.total)), width).map(
            (line) => `${line}\n`,
        ),
    );
    lines.push('\x1B\x45\x00');
    lines.push(
        ...fitRight(
            'Pago',
            formatCurrencyBR(
                sale.status === 'completed' ? Number(sale.total) : 0,
            ),
            width,
        ).map((line) => `${line}\n`),
    );
    lines.push(
        ...fitRight(
            'Restante',
            formatCurrencyBR(
                sale.status === 'completed' ? 0 : Number(sale.total),
            ),
            width,
        ).map((line) => `${line}\n`),
    );
    appendTextLines(lines, `Status final: ${translatedStatus}`, width);
    lines.push('\x1B\x61\x01');
    lines.push(`${separator}\n`);
    lines.push('\x1B\x61\x01');
    appendTextLines(lines, 'Obrigado pela preferencia', width);
    appendTextLines(lines, new Date().toLocaleString('pt-BR'), width);
    lines.push('\x1B\x61\x00');
    lines.push('\n\n\n');

    return lines;
}

export function buildThermalEscPosBytes(
    sale: Sale,
    paperWidth: ThermalPaperWidth,
): Uint8Array {
    const lines = buildThermalEscPosLines(sale, paperWidth);
    const chunks = lines.map((line) => {
        if (line.startsWith('\x1B')) {
            return Uint8Array.from([...line].map((char) => char.charCodeAt(0)));
        }

        return Uint8Array.from(
            [...line].map((char) => {
                const code = char.charCodeAt(0);

                return code <= 255 ? code : 63;
            }),
        );
    });
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const bytes = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
    }

    return bytes;
}
