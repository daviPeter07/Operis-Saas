import { Head } from '@inertiajs/react';
import TwoFactorChallengePageContent from '@/components/features/auth/two-factor-challenge-page-content';

export default function TwoFactorChallenge() {
    return (
        <>
            <Head title="Two-factor authentication" />
            <TwoFactorChallengePageContent />
        </>
    );
}
