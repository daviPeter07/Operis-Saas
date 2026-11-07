import { tornEdge } from '../../utils/constants';
import { ReceiptRow } from '../receipt-row';

/** The receipt at the end of "Como começar": the first sale, echoing the hero. */
export function FirstSaleReceipt() {
    return (
        <div
            role="img"
            aria-label="Cupom da primeira venda registrada no Operis"
            style={{ clipPath: tornEdge }}
            className="w-44 shrink-0 -rotate-2 bg-white px-4 pt-4 pb-6 font-mono text-[11px] leading-relaxed text-neutral-600 shadow-[0_14px_30px_-18px_rgb(0_0_0/0.45)]"
        >
            <p className="text-center font-bold tracking-wide text-neutral-900">
                SUA EMPRESA
            </p>
            <p className="text-center">Venda nº 1</p>
            <hr className="my-2.5 border-dashed border-neutral-300" />
            <div className="space-y-0.5">
                <ReceiptRow label="Estoque" value="atualizado" />
                <ReceiptRow label="Cupom" value="impresso" />
            </div>
        </div>
    );
}
