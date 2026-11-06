import {
    footerLinkClassName,
    landingLinks,
    landingNavigation,
} from '../../utils/constants';
import { OperisBrand } from '../operis-brand';

export function LandingFooter() {
    return (
        <footer className="border-t border-neutral-200 bg-dg-paper">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                    <OperisBrand />
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-600">
                        Sistema de gestão de vendas, estoque e financeiro para a
                        sua empresa.
                    </p>
                </div>

                <nav aria-label="Rodapé">
                    <h2 className="text-sm font-semibold text-dg-ink">
                        Nesta página
                    </h2>
                    <ul className="mt-3 space-y-2">
                        {landingNavigation.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    className={footerLinkClassName}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div>
                    <h2 className="text-sm font-semibold text-dg-ink">
                        Acesso
                    </h2>
                    <ul className="mt-3 space-y-2">
                        <li>
                            <a
                                href={landingLinks.login}
                                className={footerLinkClassName}
                            >
                                Entrar
                            </a>
                        </li>
                        <li>
                            <a
                                href={landingLinks.register}
                                className={footerLinkClassName}
                            >
                                Criar conta
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-neutral-200">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-neutral-500 sm:flex-row sm:justify-between sm:px-6">
                    <p>
                        © {new Date().getFullYear()} Operis. Todos os direitos
                        reservados.
                    </p>
                    <p>
                        Desenvolvido pela{' '}
                        <a
                            href={landingLinks.syncforge}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md font-semibold text-dg-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-dg-orange/60"
                        >
                            SyncForge
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
