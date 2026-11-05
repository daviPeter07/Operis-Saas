import { Head } from '@inertiajs/react';
import type { FrequentlyAskedQuestion } from '@/features/home/constants';
import LandingPage from '@/features/home/landing-page';

type HomeProps = {
    seoTitle: string;
    faq: FrequentlyAskedQuestion[];
};

/**
 * Public landing page. Description, Open Graph and structured data are
 * rendered by the server (resources/views/partials/landing-seo.blade.php)
 * so crawlers see them without running JavaScript.
 */
export default function Home({ seoTitle, faq }: HomeProps) {
    return (
        <>
            <Head title={seoTitle} />
            <LandingPage faq={faq} />
        </>
    );
}
