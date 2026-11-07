import { Check, X } from 'lucide-react';
import { comparisonRows } from '../../utils/constants';
import { SectionHeading } from '../section-heading';

export function ComparisonSection() {
    return (
        <section className="border-t border-neutral-200 bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeading
                    title="Controle manual ou Operis"
                    description="As perguntas do dia a dia, e onde está a resposta em cada caso."
                />

                <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-neutral-200">
                    <table className="w-full text-left text-[0.95rem]">
                        <caption className="sr-only">
                            Comparação entre o controle manual e o Operis
                        </caption>
                        <thead className="hidden bg-dg-paper text-sm sm:table-header-group">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-5 py-3 font-semibold text-dg-ink"
                                >
                                    No dia a dia
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 font-semibold text-neutral-500"
                                >
                                    Controle manual
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 font-semibold text-dg-ink"
                                >
                                    Com o Operis
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {comparisonRows.map((row) => (
                                <tr
                                    key={row.question}
                                    className="grid gap-2 px-5 py-4 sm:table-row sm:p-0"
                                >
                                    <th
                                        scope="row"
                                        className="font-semibold text-dg-ink sm:w-[30%] sm:px-5 sm:py-4"
                                    >
                                        {row.question}
                                    </th>
                                    <td className="text-neutral-500 sm:px-5 sm:py-4">
                                        <div className="flex gap-2">
                                            <X
                                                aria-label="Controle manual:"
                                                className="mt-0.5 size-4 shrink-0 text-neutral-400"
                                            />
                                            {row.before}
                                        </div>
                                    </td>
                                    <td className="text-dg-ink sm:px-5 sm:py-4">
                                        <div className="flex gap-2">
                                            <Check
                                                aria-label="Com o Operis:"
                                                className="mt-0.5 size-4 shrink-0 text-dg-orange"
                                            />
                                            {row.operis}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
