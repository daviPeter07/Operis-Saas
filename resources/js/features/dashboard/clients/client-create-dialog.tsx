import { StateCityFilter } from '@/components/filters/state-city-filter';
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
import { initialClientForm } from '@/constants/dashboard-form-initials';
import { PERSON_TYPE_OPTIONS } from '@/constants/person-type';
import { useFormState } from '@/hooks/use-form-state';
import type { ClientCreateDialogProps } from '@/types/dashboard-forms';
import { mapClientFormToPayload } from '@/utils/clients';
import { formatDocumentInputByType, formatPhoneInput } from '@/utils/form-fields';

export function ClientCreateDialog({
    open,
    onOpenChange,
    onSubmit,
}: ClientCreateDialogProps) {
    const { form, setField } = useFormState(initialClientForm, open);
    const documentLabel = form.personType === 'pj' ? 'CNPJ' : 'CPF';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[920px]">
                <DialogHeader>
                    <DialogTitle>Novo Cliente</DialogTitle>
                    <DialogDescription>
                        Preencha os dados principais e endereco do cliente.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit(mapClientFormToPayload(form));
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
                                maxLength={
                                    form.personType === 'pj' ? 18 : 14
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Localidade</Label>
                        <StateCityFilter
                            stateValue={form.state}
                            cityValue={form.city}
                            onStateChange={(state) => setField('state', state)}
                            onCityChange={(city) => setField('city', city)}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="client-street">Rua</Label>
                            <Input
                                id="client-street"
                                value={form.street}
                                onChange={(event) =>
                                    setField('street', event.target.value)
                                }
                                placeholder="Ex.: Rua das Flores"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="client-neighborhood">Bairro</Label>
                            <Input
                                id="client-neighborhood"
                                value={form.neighborhood}
                                onChange={(event) =>
                                    setField('neighborhood', event.target.value)
                                }
                                placeholder="Ex.: Centro"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="client-number">Numero</Label>
                            <Input
                                id="client-number"
                                value={form.number}
                                onChange={(event) =>
                                    setField('number', event.target.value)
                                }
                                placeholder="Ex.: 120"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="client-zip">CEP</Label>
                            <Input
                                id="client-zip"
                                value={form.zipCode}
                                onChange={(event) =>
                                    setField('zipCode', event.target.value)
                                }
                                placeholder="00000-000"
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
                        <Button type="submit">Salvar cliente</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
