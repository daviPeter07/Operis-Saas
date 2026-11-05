import { Boxes, CalendarClock } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { NumberTicker } from '@/components/ui/number-ticker';
import { formatCurrency } from '../constants';

const receiptItems = [
    { description: 'SSD NVMe 1TB', quantity: 1, price: 449.9 },
    { description: 'Memória DDR4 16GB', quantity: 1, price: 279.9 },
    { description: 'Mouse sem fio', quantity: 1, price: 89.9 },
];

const downPayment = 99.7;
const installments = [
    { number: 1, dueDate: '05/12/2026', amount: 240 },
    { number: 2, dueDate: '05/01/2027', amount: 240 },
    { number: 3, dueDate: '05/02/2027', amount: 240 },
];

const saleTotal = receiptItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
);

/** Saw-tooth bottom edge of the paper, as torn from the printer. */
const tornEdge = (() => {
    const teeth = 22;
    const points = ['0% 0%', '100% 0%', '100% calc(100% - 8px)'];

    for (let tooth = teeth; tooth >= 0; tooth--) {
        const x = (tooth / teeth) * 100;
        points.push(`${x}% ${tooth % 2 === 0 ? 'calc(100% - 8px)' : '100%'}`);
    }

    return `polygon(${points.join(', ')})`;
})();

const printDuration = 2.4;

function ReceiptRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div
            className={`flex justify-between gap-4 ${strong ? 'font-bold text-neutral-900' : ''}`}
        >
            <span>{label}</span>
            <span className="tabular-nums">{value}</span>
        </div>
    );
}

/**
 * A sale coming out of a thermal printer: the moment Operis is used most at
 * the shop counter. The paper prints once on load; reduced motion shows it still.
 */
export function ThermalReceipt() {
    const prefersReducedMotion = useReducedMotion();
    const animate = !prefersReducedMotion;

    return (
        <div
            role="img"
            aria-label={`Cupom de uma venda no crediário de ${formatCurrency(saleTotal)}: entrada de ${formatCurrency(downPayment)} e 3 parcelas de ${formatCurrency(240)}. O estoque foi atualizado e as parcelas foram para contas a receber.`}
            className="relative mx-auto w-full max-w-[22rem]"
        >
            {/* Printer */}
            <div className="relative z-10 rounded-2xl bg-dg-ink px-5 pt-4 pb-5 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.55)]">
                <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold text-white/80">
                        Impressora do caixa
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-white/60">
                        <span className="size-2 rounded-full bg-dg-orange shadow-[0_0_8px_var(--color-dg-orange)]" />
                        Imprimindo
                    </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-black/70" />
            </div>

            {/* Paper */}
            <div className="relative -mt-3 overflow-hidden px-2 sm:px-4">
                <motion.div
                    initial={animate ? { y: '-100%' } : false}
                    animate={{ y: 0 }}
                    transition={{
                        duration: printDuration,
                        ease: [0.22, 0.61, 0.36, 1],
                        delay: 0.4,
                    }}
                    style={{ clipPath: tornEdge }}
                    className="bg-white px-4 pt-7 pb-8 font-mono text-[11.5px] leading-relaxed text-neutral-600 shadow-[0_12px_30px_-20px_rgb(0_0_0/0.45)] sm:px-5 sm:text-[12.5px]"
                >
                    <p className="text-center font-bold tracking-wide text-neutral-900">
                        SUA EMPRESA
                    </p>
                    <p className="text-center">Venda nº 1042</p>
                    <p className="text-center">05/11/2026 14:32</p>

                    <hr className="my-3 border-dashed border-neutral-300" />

                    <div className="space-y-1">
                        {receiptItems.map((item) => (
                            <ReceiptRow
                                key={item.description}
                                label={`${item.quantity}x ${item.description}`}
                                value={formatCurrency(item.price)}
                            />
                        ))}
                    </div>

                    <hr className="my-3 border-dashed border-neutral-300" />

                    <div className="flex items-baseline justify-between gap-4 text-base font-bold text-neutral-900">
                        <span>TOTAL</span>
                        <span className="tabular-nums">
                            R${' '}
                            {animate ? (
                                <NumberTicker
                                    value={saleTotal}
                                    decimalPlaces={2}
                                    locale="pt-BR"
                                    delay={0.6}
                                    className="tracking-normal text-neutral-900"
                                />
                            ) : (
                                saleTotal.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                })
                            )}
                        </span>
                    </div>

                    <div className="mt-2 space-y-1">
                        <ReceiptRow label="Pagamento" value="Crediário" />
                        <ReceiptRow
                            label="Entrada"
                            value={formatCurrency(downPayment)}
                        />
                        {installments.map((installment) => (
                            <ReceiptRow
                                key={installment.number}
                                label={`${installment.number}ª parcela ${installment.dueDate}`}
                                value={formatCurrency(installment.amount)}
                            />
                        ))}
                    </div>

                    <p className="mt-4 text-center">
                        Obrigado pela preferência!
                    </p>
                </motion.div>
            </div>

            {/* What the system did behind the receipt */}
            <motion.ul
                initial={animate ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: printDuration + 0.5 }}
                className="mt-5 flex flex-wrap justify-center gap-2 text-sm font-medium text-dg-ink"
            >
                <li className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5">
                    <Boxes aria-hidden className="size-4 text-dg-orange" />
                    Estoque atualizado
                </li>
                <li className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5">
                    <CalendarClock
                        aria-hidden
                        className="size-4 text-dg-orange"
                    />
                    3 parcelas em contas a receber
                </li>
            </motion.ul>
        </div>
    );
}
