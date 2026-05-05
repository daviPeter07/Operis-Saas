import { Link } from '@inertiajs/react';
import { BarChart3, CheckCircle2, LockKeyhole, UsersRound } from 'lucide-react';
import OperisLogoIcon from '@/components/operis-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-black px-6 py-10 text-white">
            <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 lg:grid-cols-[0.95fr_1.05fr]">
                <aside className="hidden flex-col justify-between border-r border-zinc-800 bg-black p-8 lg:flex">
                    <div>
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3 text-lg font-semibold text-white"
                        >
                            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-black">
                                <OperisLogoIcon className="size-5" />
                            </div>

                            <span>Operis</span>
                        </Link>
                    </div>

                    <div className="my-14 space-y-7">
                        <div className="space-y-3">
                            <span className="text-sm font-medium text-accent">
                                Sistema de gestão empresarial
                            </span>

                            <h1 className="text-3xl leading-tight font-semibold tracking-tight text-white">
                                Controle sua operação de forma simples.
                            </h1>

                            <p className="text-sm leading-6 text-zinc-400">
                                O Operis ajuda sua equipe a organizar clientes,
                                vendas, atendimentos e informações importantes
                                em um só lugar.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <InfoItem
                                icon={BarChart3}
                                title="Dados mais claros"
                                description="Acompanhe melhor o que acontece no negócio."
                            />

                            <InfoItem
                                icon={UsersRound}
                                title="Informações centralizadas"
                                description="Organize clientes, registros e processos."
                            />

                            <InfoItem
                                icon={CheckCircle2}
                                title="Mais controle na rotina"
                                description="Reduza bagunça e acompanhe tudo com segurança."
                            />
                        </div>
                    </div>

                    <p className="text-xs text-zinc-500">
                        © {new Date().getFullYear()} Operis. Todos os direitos reservados.
                    </p>
                </aside>

                <div className="flex items-center justify-center bg-zinc-950 p-6 sm:p-8 lg:p-10">
                    <div className="w-full max-w-sm">
                        <div className="mb-8 flex justify-center lg:hidden">
                            <Link
                                href={home()}
                                className="inline-flex items-center gap-3"
                            >
                                <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-black">
                                    <OperisLogoIcon className="size-6" />
                                </div>

                                <span className="text-xl font-semibold text-white">
                                    Operis
                                </span>
                            </Link>
                        </div>

                        <div className="mb-8 space-y-2 text-center">
                            <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-lg bg-zinc-900 text-accent">
                                <LockKeyhole className="size-5" />
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-white">
                                {title}
                            </h1>

                            <p className="text-sm leading-6 text-zinc-400">
                                {description}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>
            </section>
        </main>
    );
}

function InfoItem({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-3">
            <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-accent">
                <Icon className="size-4" />
            </div>

            <div>
                <h3 className="text-sm font-medium text-white">{title}</h3>

                <p className="mt-0.5 text-sm leading-5 text-zinc-400">
                    {description}
                </p>
            </div>
        </div>
    );
}
