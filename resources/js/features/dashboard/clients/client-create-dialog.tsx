import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCreateCustomer } from '@/hooks/use-customers';
import { initialClientForm } from '@/constants/dashboard-form-initials';
import { PERSON_TYPE_OPTIONS } from '@/constants/person-type';
import { useFormState } from '@/hooks/use-form-state';
import type { ClientCreateDialogProps } from '@/types/dashboard-forms';
import { formatDocumentInputByType, formatPhoneInput } from '@/utils/form-fields';

export function ClientCreateDialog({
    open,
    onOpenChange,
}: ClientCreateDialogProps) {
    const { form, setField } = useFormState(initialClientForm, open);
    const createCustomer = useCreateCustomer();
    const isSubmitting = createCustomer.isPending;
    const documentLabel = form.personType === 'pj' ? 'CNPJ' : 'CPF';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[920px]">
                <DialogHeader>
                    <DialogTitle>Novo Cliente</DialogTitle>
                    <DialogDescription>
                        Preencha os dados principais do cliente.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();

                        createCustomer.mutate(
                            {
                                name: form.name,
                                email: form.email,
                                phone: form.phone,
                                document: form.document,
                                person_type: form.personType,
                            },
                            {
                                onSuccess: () => {
                                    onOpenChange(false);
                                },
                            },
                        );
                    }}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="client-name">Nome</Label>
                            <Input
                                id="client-name"
                                value={form.name}
                                onChange={(event) =>
                                    setField('name', event.target.value)
                                }
                                placeholder="Nome completo ou razao social"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="client-person-type">
                                Tipo de pessoa
                            </Label>
                            <Select
                                value={form.personType}
                                onValueChange={(value) => {
                                    if (value === 'pf' || value === 'pj') {
                                        setField('personType', value);
                                        setField('document', '');
                                    }
                                }}
                            >
                                <SelectTrigger id="client-person-type">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PERSON_TYPE_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="client-email">Email</Label>
                            <Input
                                id="client-email"
                                type="email"
                                value={form.email}
                                onChange={(event) =>
                                    setField('email', event.target.value)
                                }
                                placeholder="cliente@empresa.com"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="client-phone">Telefone</Label>
                            <Input
                                id="client-phone"
                                value={form.phone}
                                onChange={(event) =>
                                    setField(
                                        'phone',
                                        formatPhoneInput(event.target.value),
                                    )
                                }
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="client-document">
                                {documentLabel}
                            </Label>
                            <Input
                                id="client-document"
                                value={form.document}
                                onChange={(event) =>
                                    setField(
                                        'document',
                                        formatDocumentInputByType(
                                            event.target.value,
                                            form.personType,
                                        ),
                                    )
                                }
                                placeholder={
                                    form.personType === 'pj'
                                        ? '00.000.000/0000-00'
                                        : '000.000.000-00'
                                }
                                maxLength={form.personType === 'pj' ? 18 : 14}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Criando...' : 'Criar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
