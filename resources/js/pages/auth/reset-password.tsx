import { Head } from '@inertiajs/react';
import ResetPasswordPageContent from '@/features/auth/reset-password-page-content';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <>
            <Head title="Reset password" />
            <ResetPasswordPageContent token={token} email={email} />
        </>
    );
}

ResetPassword.layout = {
    title: 'Reset password',
    description: 'Please enter your new password below',
};
