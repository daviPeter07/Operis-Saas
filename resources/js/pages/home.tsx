import { Head } from '@inertiajs/react';
import type {
    FrequentlyAskedQuestion,
    LandingUpdate,
} from '@/features/home/constants';
import LandingPage from '@/features/home/landing-page';

type HomeProps = {
    seoTitle: string;
    faq: FrequentlyAskedQuestion[];
    updates: LandingUpdate[];
};

/**
 * Public landing page. Description, Open Graph and structured data are
 * rendered by the server (resources/views/partials/landing-seo.blade.php)
 * so crawlers see them without running JavaScript.
 */
export default function Home({ seoTitle, faq, updates }: HomeProps) {
    return (
        <>
            <Head title={seoTitle} />
            <LandingPage faq={faq} updates={updates} />
        </>
    );
}
