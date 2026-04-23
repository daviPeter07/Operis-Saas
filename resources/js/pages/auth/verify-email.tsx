import { Head } from '@inertiajs/react';
import VerifyEmailPageContent from '@/components/features/auth/verify-email-page-content';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />
            <VerifyEmailPageContent status={status} />
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verify email',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};
