import { getContactWhatsAppUrl } from '../../utils/functions';
import { LandingButton } from '../landing-button';
import { ThermalReceipt } from '../thermal-receipt';

export function HeroSection() {
    return (
        <section id="inicio" className="scroll-mt-16 overflow-hidden bg-white">
            <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-20 lg:pb-28">
                <div>
                    <h1 className="max-w-xl font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-dg-ink sm:text-[3.6rem]">
                        Organize o seu estoque e saiba quem já pagou e quem
                        ainda deve.
                    </h1>
                    <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-neutral-600">
                        Para empresas e para quem trabalha por conta própria.
                        Registre a venda e o Operis baixa o estoque, gera as
                        parcelas e mostra o que está em atraso. No navegador do
                        computador ou do celular, sem instalar nada.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <LandingButton
                            href={getContactWhatsAppUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Conversar no WhatsApp
                        </LandingButton>
                        <LandingButton href="#demonstracao" variant="outline">
                            Ver o painel
                        </LandingButton>
                    </div>
                </div>

                <div className="rounded-[2rem] bg-dg-paper px-3 py-8 sm:px-10 sm:py-10">
                    <ThermalReceipt />
                </div>
            </div>
        </section>
    );
}
