import { Head } from '@inertiajs/react';
import ForgotPasswordPageContent from '@/components/features/auth/forgot-password-page-content';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />
            <ForgotPasswordPageContent status={status} />
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
    description: 'Enter your email to receive a password reset link',
};
