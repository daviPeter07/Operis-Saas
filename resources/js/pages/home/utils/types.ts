import type { LucideIcon } from 'lucide-react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

/** FAQ entries come from config/landing.php so the page and its structured data match. */
export type FrequentlyAskedQuestion = {
    question: string;
    answer: string;
};

/** "Últimas atualizações" entries come from config/landing.php (3 most recent). */
export type LandingUpdateType = 'novidade' | 'melhoria' | 'correcao';

export type LandingUpdate = {
    date: string;
    type: LandingUpdateType;
    title: string;
    description: string;
};

export type BillingPeriod = 'mês' | 'ano';

export type PainPoint = {
    icon: LucideIcon;
    title: string;
    pain: string;
    solution: string;
};

export type ComparisonRow = {
    question: string;
    before: string;
    operis: string;
};

export type StartStep = {
    title: string;
    description: string;
};

export type LegalSection = {
    title: string;
    paragraphs?: string[];
    items?: string[];
    /** Closing sentence shown after the list. */
    note?: string;
};

export type LegalDocument = {
    title: string;
    description: string;
    sections: LegalSection[];
};

export type LegalPageProps = {
    document: LegalDocument;
};

export type PricingPlan = {
    id: string;
    /** Label on the Mensal | Anual switch. */
    label: string;
    name: string;
    description: string;
    /** In reais; null while the value is not defined ("Valor em breve"). */
    price: number | null;
    /** Previous price, shown struck through above the current one. */
    originalPrice?: number;
    period: BillingPeriod;
    badge?: string;
};

export type BillingToggleProps = {
    plans: PricingPlan[];
    value: BillingPeriod;
    onChange: (period: BillingPeriod) => void;
};

export type PlanCardProps = {
    plan: PricingPlan;
    benefits: readonly string[];
};

export type DemoMetric = {
    label: string;
    value: string;
    icon: LucideIcon;
    iconClassName: string;
};

export type DemoActivity = {
    description: string;
    responsible: string;
    amount?: string;
    time: string;
    icon: LucideIcon;
    iconClassName: string;
};

export type DgLogoMarkProps = {
    className?: string;
};

export type OperisBrandProps = {
    className?: string;
};

export type FaqSectionProps = {
    questions: FrequentlyAskedQuestion[];
};

export type LandingButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: 'solid' | 'outline';
};

export type HomeProps = {
    seoTitle: string;
    faq: FrequentlyAskedQuestion[];
    updates: LandingUpdate[];
};

export type ScaledScreenProps = {
    width: number;
    height: number;
    children: ReactNode;
};

export type SectionHeadingProps = {
    title: string;
    description: string;
};

export type UpdatesSectionProps = {
    updates: LandingUpdate[];
};
