import { Link } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';

export function AdminRequestPage() {
    return (
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                <ShieldAlert className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-semibold text-foreground">
                Solicitação para o admin
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A ação que você tentou executar exige aprovação administrativa.
                No MVP, esse fluxo é demonstrado como uma solicitação visual ao
                responsável da empresa.
            </p>

            <div className="mt-6 rounded-xl border border-border/70 bg-background/40 p-4 text-left">
                <p className="text-sm font-medium text-foreground">
                    Próximos passos
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>
                        1. Solicite a alteração ao administrador da empresa.
                    </li>
                    <li>
                        2. Aguarde a liberação do acesso ou a execução da ação.
                    </li>
                    <li>3. Retorne à equipe após a aprovação.</li>
                </ul>
            </div>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                    href="/dashboard/team"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-500/90"
                >
                    Voltar para equipe
                </Link>
                <Link
                    href="/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
                >
                    Ir para visão geral
                </Link>
            </div>
        </div>
    );
}
