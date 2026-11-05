import { Boxes, Printer, Smartphone, Wallet } from 'lucide-react';
import { Iphone } from '@/components/ui/iphone';
import { Safari } from '@/components/ui/safari';
import {
    DesktopDemoScreen,
    MobileDemoScreen,
    desktopScreenSize,
    mobileScreenSize,
} from './demo-screens';
import { ScaledScreen } from './scaled-screen';

const highlights = [
    {
        icon: Wallet,
        title: 'Vendas e crediário',
        description:
            'PIX, dinheiro, cartão ou parcelado com entrada. As parcelas vão sozinhas para contas a receber.',
    },
    {
        icon: Boxes,
        title: 'Estoque sem planilha',
        description:
            'Cada venda, compra ou cancelamento atualiza o estoque e fica no histórico do produto.',
    },
    {
        icon: Printer,
        title: 'Cupom e fatura',
        description:
            'Imprima o cupom na impressora térmica do caixa ou envie a fatura em PDF para o cliente.',
    },
    {
        icon: Smartphone,
        title: 'No computador e no celular',
        description:
            'A mesma conta abre no navegador do caixa, do notebook ou do celular.',
    },
];

export function DemoSection() {
    return (
        <section
            id="demonstracao"
            className="scroll-mt-16 overflow-hidden bg-dg-paper py-20 sm:py-28"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="max-w-2xl">
                    <h2 className="font-display text-3xl leading-tight font-bold tracking-[-0.03em] text-dg-ink sm:text-[2.6rem]">
                        O mesmo painel no caixa e no bolso
                    </h2>
                    <p className="mt-4 text-[1.05rem] leading-relaxed text-neutral-600">
                        Veja as vendas do mês, o que falta receber e os produtos
                        que estão acabando assim que entrar. No celular, a tela
                        se ajusta e o botão de nova venda fica sempre à mão.
                    </p>
                </div>

                <div
                    role="img"
                    aria-label="Painel do Operis aberto no computador e no celular, com vendas do mês, valores a receber, estoque baixo, gráfico de vendas por dia e vendas recentes."
                    className="relative mt-14 pb-24 sm:pb-16 lg:mr-[-6%]"
                >
                    <Safari
                        url="suaempresa.com.br/operis"
                        className="rounded-xl shadow-[0_30px_70px_-35px_rgb(0_0_0/0.45)]"
                    >
                        <ScaledScreen {...desktopScreenSize}>
                            <DesktopDemoScreen />
                        </ScaledScreen>
                    </Safari>

                    <div className="absolute right-2 -bottom-6 w-[34%] max-w-[230px] min-w-[130px] drop-shadow-[0_24px_40px_rgb(0_0_0/0.3)] sm:right-[6%] lg:-bottom-14">
                        <Iphone>
                            <ScaledScreen {...mobileScreenSize}>
                                <MobileDemoScreen />
                            </ScaledScreen>
                        </Iphone>
                    </div>
                </div>

                <ul className="mt-20 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                    {highlights.map(({ icon: Icon, title, description }) => (
                        <li key={title}>
                            <Icon
                                aria-hidden
                                className="size-6 text-dg-orange"
                            />
                            <h3 className="mt-3 font-display text-lg font-bold text-dg-ink">
                                {title}
                            </h3>
                            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-neutral-600">
                                {description}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
