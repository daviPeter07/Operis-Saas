import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { parseLocalDate } from '../../utils/functions';
import type { CheckoutSectionProps } from '../../utils/types';

export function SaleDateField({ form }: CheckoutSectionProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleOutsideClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () =>
            document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative space-y-2">
            <Label>Data</Label>
            <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsOpen((current) => !current)}
            >
                <CalendarDays className="mr-2 h-4 w-4" />
                {form.saleDate
                    ? format(parseLocalDate(form.saleDate), 'dd/MM/yyyy', {
                          locale: ptBR,
                      })
                    : 'Selecionar data'}
            </Button>
            {isOpen ? (
                <div className="absolute bottom-[calc(100%+0.25rem)] left-0 z-90 rounded-md border bg-background p-2 shadow-xl">
                    <Calendar
                        mode="single"
                        selected={
                            form.saleDate
                                ? parseLocalDate(form.saleDate)
                                : undefined
                        }
                        onSelect={(date) => {
                            if (date) {
                                form.setSaleDate(format(date, 'yyyy-MM-dd'));
                            }

                            setIsOpen(false);
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
}
