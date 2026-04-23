import { Head } from '@inertiajs/react';
import ConfirmPasswordPageContent from '@/components/features/auth/confirm-password-page-content';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />
            <ConfirmPasswordPageContent />
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Confirm your password',
    description:
        'This is a secure area of the application. Please confirm your password before continuing.',
};
