import { Head } from '@inertiajs/react';
import { useLayoutEffect } from 'react';
import { lockLightTheme } from '@/hooks/use-appearance';
import { ComparisonSection } from './components/comparison-section';
import { DemoSection } from './components/demo-section';
import { FaqSection } from './components/faq-section';
import { HeroSection } from './components/hero-section';
import { LandingFooter } from './components/landing-footer';
import { LandingHeader } from './components/landing-header';
import { PainPointsSection } from './components/pain-points-section';
import { PricingSection } from './components/pricing-section';
import { StartStepsSection } from './components/start-steps-section';
import { UpdatesSection } from './components/updates-section';
import type { HomeProps } from './utils/types';

/**
 * Public landing page, light-only: the user's dark theme does not apply here.
 * Description, Open Graph and structured data are rendered by the server
 * (resources/views/partials/landing-seo.blade.php) so crawlers see them without
 * running JavaScript.
 */
export default function Home({ seoTitle, faq, updates }: HomeProps) {
    useLayoutEffect(() => lockLightTheme(), []);

    return (
        <>
            <Head title={seoTitle} />
            <div className="flex min-h-screen flex-col bg-white font-sans text-dg-ink antialiased">
                <LandingHeader />
                <main className="flex-1">
                    <HeroSection />
                    <PainPointsSection />
                    <DemoSection />
                    <ComparisonSection />
                    <PricingSection />
                    <StartStepsSection />
                    <UpdatesSection updates={updates} />
                    <FaqSection questions={faq} />
                </main>
                <LandingFooter />
            </div>
        </>
    );
}
