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
