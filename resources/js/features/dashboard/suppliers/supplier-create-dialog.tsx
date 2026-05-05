import * as React from 'react';
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
import { initialSupplierForm } from '@/constants/dashboard-form-initials';
import { PERSON_TYPE_OPTIONS } from '@/constants/person-type';
import { useFormState } from '@/hooks/use-form-state';
import { formatDocumentInputByType, formatPhoneInput } from '@/utils/form-fields';

type SupplierCreatePayload = {
    name: string;
    email: string;
    phone: string;
    document: string;
};

type SupplierCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: SupplierCreatePayload) => void;
};

export function SupplierCreateDialog({
    open,
    onOpenChange,
    onSubmit,
}: SupplierCreateDialogProps) {
    const { form, setField } = useFormState(initialSupplierForm, open);
    const documentLabel = form.personType === 'pj' ? 'CNPJ' : 'CPF';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[920px]">
                <DialogHeader>
                    <DialogTitle>Novo Fornecedor</DialogTitle>
                    <DialogDescription>
                        Preencha os dados principais e endereco do fornecedor.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();

                        onSubmit({
                            name: form.name,
                            email: form.email,
                            phone: form.phone,
                            document: form.document,
                        });
                    }}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-name">Nome</Label>
                            <Input
                                id="supplier-name"
                                value={form.name}
                                onChange={(event) =>
                                    setField('name', event.target.value)
                                }
                                placeholder="Razao social ou nome fantasia"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="supplier-person-type">
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
                                <SelectTrigger id="supplier-person-type">
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
                            <Label htmlFor="supplier-email">Email</Label>
                            <Input
                                id="supplier-email"
                                type="email"
                                value={form.email}
                                onChange={(event) =>
                                    setField('email', event.target.value)
                                }
                                placeholder="contato@fornecedor.com"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="supplier-phone">Telefone</Label>
                            <Input
                                id="supplier-phone"
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
                            <Label htmlFor="supplier-document">
                                {documentLabel}
                            </Label>
                            <Input
                                id="supplier-document"
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
                            <Label htmlFor="supplier-street">Rua</Label>
                            <Input
                                id="supplier-street"
                                value={form.street}
                                onChange={(event) =>
                                    setField('street', event.target.value)
                                }
                                placeholder="Ex.: Rua das Flores"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-neighborhood">
                                Bairro
                            </Label>
                            <Input
                                id="supplier-neighborhood"
                                value={form.neighborhood}
                                onChange={(event) =>
                                    setField('neighborhood', event.target.value)
                                }
                                placeholder="Ex.: Centro"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-number">Numero</Label>
                            <Input
                                id="supplier-number"
                                value={form.number}
                                onChange={(event) =>
                                    setField('number', event.target.value)
                                }
                                placeholder="Ex.: 120"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-zip">CEP</Label>
                            <Input
                                id="supplier-zip"
                                value={form.zipCode}
                                onChange={(event) =>
                                    setField(
                                        'zipCode',
                                        event.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 8)
                                            .replace(/(\d{5})(\d)/, '$1-$2'),
                                    )
                                }
                                placeholder="00000-000"
                                maxLength={9}
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
                        <Button type="submit">Salvar fornecedor</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
