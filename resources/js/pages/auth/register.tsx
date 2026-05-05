import { Head } from '@inertiajs/react';
import RegisterPageContent from '@/features/auth/register-page-content';

export default function Register() {
    return (
        <>
            <Head title="Criar conta" />
            <RegisterPageContent />
        </>
    );
}

Register.layout = {
    title: 'Crie sua conta',
    description: 'Preencha seus dados para começar',
};
