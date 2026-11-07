import { landingLinks, landingNavigation } from '../../utils/constants';
import { LandingButton } from '../landing-button';
import { OperisBrand } from '../operis-brand';

export function LandingHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/85 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
                <a
                    href={`${landingLinks.home}#inicio`}
                    aria-label="Operis, ir para o início"
                    className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-dg-orange/60"
                >
                    <OperisBrand />
                </a>

                <nav aria-label="Principal" className="hidden md:block">
                    <ul className="flex items-center gap-8">
                        {landingNavigation.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    className="rounded-md text-sm font-medium text-neutral-600 outline-none hover:text-dg-ink focus-visible:ring-3 focus-visible:ring-dg-orange/60"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex items-center gap-1 sm:gap-2">
                    <a
                        href={landingLinks.login}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-dg-ink outline-none hover:bg-neutral-100 focus-visible:ring-3 focus-visible:ring-dg-orange/60"
                    >
                        Entrar
                    </a>
                    <LandingButton
                        href={landingLinks.register}
                        className="h-9 px-4"
                    >
                        Criar conta
                    </LandingButton>
                </div>
            </div>
        </header>
    );
}
