import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';

type DatePickerInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export function DatePickerInput({
    value,
    onChange,
    placeholder,
    className,
}: DatePickerInputProps) {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        const onMouseDown = (event: MouseEvent) => {
            if (!containerRef.current) {
                return;
            }

            if (!containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onMouseDown);

        return () => {
            document.removeEventListener('mousedown', onMouseDown);
        };
    }, []);

    const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

    const toIsoDate = (date: Date): string => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    return (
        <div ref={containerRef} className={`relative ${className || ''}`}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
                <span
                    className={
                        value ? 'text-foreground' : 'text-muted-foreground'
                    }
                >
                    {value
                        ? format(selectedDate as Date, 'dd/MM/yyyy', {
                              locale: ptBR,
                          })
                        : placeholder || 'Selecione uma data'}
                </span>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </button>

            <Input type="hidden" value={value} onChange={() => {}} readOnly />

            {open ? (
                <div className="absolute z-50 mt-2 rounded-md border bg-background p-2 shadow-lg">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (!date) {
                                return;
                            }

                            onChange(toIsoDate(date));
                            setOpen(false);
                        }}
                        locale={ptBR}
                    />
                </div>
            ) : null}
        </div>
    );
}
