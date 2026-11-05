import { Head } from '@inertiajs/react';
import LandingPage from '@/features/home/landing-page';

export default function Home() {
    return (
        <>
            <Head title="Sistema de gestão para lojas">
                <meta
                    name="description"
                    content="Operis: vendas, crediário, estoque, contas a pagar e a receber e cupom térmico num sistema só, no computador e no celular."
                />
            </Head>
            <LandingPage />
        </>
    );
}
