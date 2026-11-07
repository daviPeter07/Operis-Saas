import { useState } from 'react';
import { pricingPlans, promotionalPlan } from '../../utils/constants';
import type { BillingPeriod } from '../../utils/types';
import { BillingToggle } from '../billing-toggle';
import { PlanCard } from '../plan-card';
import { SectionHeading } from '../section-heading';

export function PricingSection() {
    // The yearly plan is the promotion, so it opens selected.
    const [period, setPeriod] = useState<BillingPeriod>('ano');
    const plan =
        pricingPlans.find((item) => item.period === period) ?? pricingPlans[0];

    return (
        <section
            id="preco"
            className="scroll-mt-16 border-t border-neutral-200 bg-white py-20 sm:py-28"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeading
                    title="Escolha como pagar"
                    description="Sem módulo cobrado à parte e sem limite de vendas. Por mês ou por ano, você usa tudo o que o Operis oferece."
                />

                <div className="mt-10 flex justify-center">
                    <BillingToggle
                        plans={pricingPlans}
                        value={period}
                        onChange={setPeriod}
                    />
                </div>

                <div className="mx-auto mt-6 max-w-sm">
                    <PlanCard plan={plan} benefits={promotionalPlan.benefits} />
                </div>
            </div>
        </section>
    );
}
