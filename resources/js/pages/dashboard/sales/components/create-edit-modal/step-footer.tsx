import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SALE_STEPS, SALE_STEP_HINTS } from '../../utils/constants';
import type { StepFooterProps } from '../../utils/types';

export function StepFooter({
    step,
    canAdvance,
    isSubmitting,
    summary,
    onBack,
    onCancel,
    onNext,
    onConfirm,
}: StepFooterProps) {
    const isLast = step === SALE_STEPS.length - 1;
    const hint = canAdvance ? '' : SALE_STEP_HINTS[SALE_STEPS[step].key];

    return (
        <div className="flex flex-col gap-3 border-t bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-5 text-sm">
                {hint ? (
                    <span className="text-muted-foreground">{hint}</span>
                ) : (
                    summary
                )}
            </div>
            <div className="flex gap-2 sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 gap-2 sm:flex-none"
                    onClick={step === 0 ? onCancel : onBack}
                >
                    {step === 0 ? null : <ArrowLeft className="size-4" />}
                    {step === 0 ? 'Cancelar' : 'Voltar'}
                </Button>
                {isLast ? (
                    <Button
                        type="button"
                        className="flex-1 sm:flex-none"
                        disabled={isSubmitting}
                        onClick={onConfirm}
                    >
                        {isSubmitting
                            ? 'Registrando...'
                            : 'Confirmar e registrar'}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        className="flex-1 gap-2 sm:flex-none"
                        disabled={!canAdvance}
                        onClick={onNext}
                    >
                        Próximo
                        <ArrowRight className="size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
