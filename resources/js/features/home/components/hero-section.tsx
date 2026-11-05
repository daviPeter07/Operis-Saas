import { landingLinks } from '../constants';
import { LandingButton } from './landing-button';
import { ThermalReceipt } from './thermal-receipt';

export function HeroSection() {
    return (
        <section id="inicio" className="scroll-mt-16 overflow-hidden bg-white">
            <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-20 lg:pb-28">
                <div>
                    <h1 className="max-w-xl font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-dg-ink sm:text-[3.6rem]">
                        Do balcão ao caixa, a loja inteira num sistema só.
                    </h1>
                    <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-neutral-600">
                        O Operis registra a venda, baixa o estoque, gera as
                        parcelas do crediário e imprime o cupom. É o sistema que
                        a DG Computer usa todos os dias, no computador e no
                        celular.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <LandingButton href={landingLinks.register}>
                            Criar minha conta
                        </LandingButton>
                        <LandingButton href="#demonstracao" variant="outline">
                            Ver o sistema
                        </LandingButton>
                    </div>
                    <p className="mt-6 text-sm text-neutral-500">
                        R$ 300 por ano, com todos os módulos incluídos.
                    </p>
                </div>

                <div className="rounded-[2rem] bg-dg-paper px-3 py-8 sm:px-10 sm:py-10">
                    <ThermalReceipt />
                </div>
            </div>
        </section>
    );
}
