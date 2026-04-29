import { Head } from '@inertiajs/react';
import LoginPageContent from '@/features/auth/login-page-content';

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
            <Head title="Log in" />
            <LoginPageContent
                status={status}
                canResetPassword={canResetPassword}
                canRegister={canRegister}
            />
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
