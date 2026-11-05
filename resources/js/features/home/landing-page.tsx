import { useLayoutEffect } from 'react';
import { lockLightTheme } from '@/hooks/use-appearance';
import { DemoSection } from './components/demo-section';
import { FaqSection } from './components/faq-section';
import { HeroSection } from './components/hero-section';
import { LandingFooter } from './components/landing-footer';
import { LandingHeader } from './components/landing-header';
import { PricingSection } from './components/pricing-section';
import type { FrequentlyAskedQuestion } from './constants';

/** Public landing page. It is light-only: the user's dark theme does not apply here. */
type LandingPageProps = {
    faq: FrequentlyAskedQuestion[];
};

export default function LandingPage({ faq }: LandingPageProps) {
    useLayoutEffect(() => lockLightTheme(), []);

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans text-dg-ink antialiased">
            <LandingHeader />
            <main className="flex-1">
                <HeroSection />
                <DemoSection />
                <PricingSection />
                <FaqSection questions={faq} />
            </main>
            <LandingFooter />
        </div>
    );
}
