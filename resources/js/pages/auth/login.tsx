import { Head } from '@inertiajs/react';
import { LoginPageContent } from './components/login-page-content';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Entrar" />
            <LoginPageContent
                status={status}
                canResetPassword={canResetPassword}
                canRegister={canRegister}
            />
        </>
    );
}

Login.layout = {
    title: 'Acesse sua conta',
    description: 'Informe seu e-mail e senha para continuar',
};
