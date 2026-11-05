import { useLayoutEffect } from 'react';
import { lockLightTheme } from '@/hooks/use-appearance';
import { DemoSection } from './components/demo-section';
import { FaqSection } from './components/faq-section';
import { HeroSection } from './components/hero-section';
import { LandingFooter } from './components/landing-footer';
import { LandingHeader } from './components/landing-header';
import { PricingSection } from './components/pricing-section';
import { UpdatesSection } from './components/updates-section';
import type { FrequentlyAskedQuestion, LandingUpdate } from './constants';

type LandingPageProps = {
    faq: FrequentlyAskedQuestion[];
    updates: LandingUpdate[];
};

/** Public landing page. It is light-only: the user's dark theme does not apply here. */
export default function LandingPage({ faq, updates }: LandingPageProps) {
    useLayoutEffect(() => lockLightTheme(), []);

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans text-dg-ink antialiased">
            <LandingHeader />
            <main className="flex-1">
                <HeroSection />
                <DemoSection />
                <UpdatesSection updates={updates} />
                <PricingSection />
                <FaqSection questions={faq} />
            </main>
            <LandingFooter />
        </div>
    );
}
