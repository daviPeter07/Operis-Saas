import { useForm } from 'react-hook-form';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { initialClientForm } from '@/constants/dashboard-form-initials';
import { PERSON_TYPE_OPTIONS } from '@/constants/person-type';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/use-customers';
import { useFormState } from '@/hooks/use-form-state';
import type { ClientCreateDialogProps } from '@/types/dashboard-forms';
import {
    formatDocumentInputByType,
    formatPhoneInput,
    formatCurrencyInput,
    parseMaskedFieldValue,
} from '@/utils/form-fields';

const MAX_CREDIARIO_LIMIT = 100000;

function formatCreditLimitFromAmount(amount: number | undefined): string {
    const safeAmount = Number(amount ?? 0);

    if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
        return '';
    }

    return formatCurrencyInput(String(Math.round(safeAmount * 100)));
}

function buildInitialValues(props: ClientCreateDialogProps) {
    if (!props.initialData) {
        return initialClientForm;
    }

    return {
        ...initialClientForm,
        name: props.initialData.name ?? '',
        personType: props.initialData.personType ?? 'pf',
        email: props.initialData.email ?? '',
        phone: props.initialData.phone ?? '',
        document: props.initialData.document ?? '',
        status: props.initialData.status ?? 'active',
        creditEnabled: props.initialData.creditEnabled ? 'yes' : 'no',
        creditLimit: formatCreditLimitFromAmount(props.initialData.creditLimit),
        creditTermDays: String(props.initialData.creditTermDays ?? 30),
    };
}

export function ClientCreateDialog(props: ClientCreateDialogProps) {
    const { open, onOpenChange, onSuccess, initialData } = props;
    const { form, setField } = useFormState(buildInitialValues(props), open);
    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();
    const isEditing = Boolean(initialData?.id);
    const isSubmitting = createCustomer.isPending || updateCustomer.isPending;
    const documentLabel = form.personType === 'pj' ? 'CNPJ' : 'CPF';
    const {
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<Record<string, string>>({ mode: 'onSubmit' });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[920px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
                    </DialogTitle>
                    <DialogDescription>
                        Preencha os dados principais do cliente.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();

                        if (!form.name.trim()) {
                            setError('name', {
                                type: 'required',
                                message: 'Nome é obrigatório.',
                            });

                            return;
                        }

                        const creditEnabled = form.creditEnabled === 'yes';
                        const parsedCreditLimit = Number(
                            parseMaskedFieldValue(form.creditLimit, 'currency') ||
                                0,
                        );

                        if (
                            creditEnabled &&
                            Number.isFinite(parsedCreditLimit) &&
                            parsedCreditLimit > MAX_CREDIARIO_LIMIT
                        ) {
                            setError('creditLimit', {
                                type: 'max',
                                message:
                                    'Limite do crediario deve ser no maximo R$ 100.000,00.',
                            });

                            return;
                        }

                        clearErrors('creditLimit');

                        const payload = {
                            name: form.name,
                            email: form.email,
                            phone: form.phone,
                            document: form.document,
                            person_type: form.personType,
                            status: form.status || 'active',
                            credit_enabled: creditEnabled,
                            credit_limit: creditEnabled
                                ? parsedCreditLimit
                                : 0,
                            credit_term_days: Number(form.creditTermDays || 30),
                        };

                        if (isEditing && initialData?.id) {
                            updateCustomer.mutate(
                                {
                                    id: initialData.id,
                                    data: payload,
                                },
                                {
                                    onSuccess: (data) => {
                                        onOpenChange(false);
                                        onSuccess?.({
                                            id: data.id,
                                            name: data.name,
                                        });
                                    },
                                    onError: (error) => {
                                        console.error('Update error:', error);
                                        setError('name', {
                                            type: 'manual',
                                            message: 'Erro ao atualizar cliente.',
                                        });
                                    },
                                },
                            );

                            return;
                        }

                        createCustomer.mutate(payload, {
                            onSuccess: (data) => {
                                onOpenChange(false);
                                onSuccess?.({ id: data.id, name: data.name });
                            },
                            onError: () => {
                                setError('name', {
                                    type: 'manual',
                                    message: 'Erro ao criar cliente.',
                                });
                            },
                        });
                    }}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="client-name">
                                Nome <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="client-name"
                                value={form.name}
                                onChange={(event) => {
                                        setField('name', event.target.value);
                                        clearErrors('name');
                                    }
                                }
                                placeholder="Nome completo ou razao social"
                                required
                            />
                            {errors.name?.message ? (
                                <p className="text-xs text-destructive">
                                    {String(errors.name.message)}
                                </p>
                            ) : null}
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

                        <div className="grid gap-2">
                            <Label htmlFor="client-credit-enabled">
                                Crediario
                            </Label>
                            <Select
                                value={form.creditEnabled}
                                onValueChange={(value) => {
                                    if (value === 'yes' || value === 'no') {
                                        setField('creditEnabled', value);

                                        if (value === 'no') {
                                            clearErrors('creditLimit');
                                        }
                                    }
                                }}
                            >
                                <SelectTrigger id="client-credit-enabled">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">
                                        Habilitado
                                    </SelectItem>
                                    <SelectItem value="no">
                                        Desabilitado
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="client-credit-limit">
                                Limite do crediario
                            </Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <Input
                                                id="client-credit-limit"
                                                value={form.creditLimit}
                                                onChange={(event) => {
                                                    setField(
                                                        'creditLimit',
                                                        formatCurrencyInput(
                                                            event.target.value,
                                                        ),
                                                    );
                                                    clearErrors('creditLimit');
                                                }}
                                                placeholder="R$ 0,00"
                                                disabled={
                                                    form.creditEnabled === 'no'
                                                }
                                                className={
                                                    form.creditEnabled === 'no'
                                                        ? 'cursor-not-allowed'
                                                        : ''
                                                }
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    {form.creditEnabled === 'no' && (
                                        <TooltipContent>
                                            Habilite o crediário para preenchem
                                            este campo
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                            {errors.creditLimit?.message ? (
                                <p className="text-xs text-destructive">
                                    {String(errors.creditLimit.message)}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="client-credit-term">
                                Prazo do crediario (dias)
                            </Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <Select
                                                value={form.creditTermDays}
                                                onValueChange={(value) => {
                                                    if (
                                                        form.creditEnabled ===
                                                        'yes'
                                                    ) {
                                                        setField(
                                                            'creditTermDays',
                                                            value,
                                                        );
                                                    }
                                                }}
                                                disabled={
                                                    form.creditEnabled === 'no'
                                                }
                                            >
                                                <SelectTrigger
                                                    id="client-credit-term"
                                                    disabled={
                                                        form.creditEnabled ===
                                                        'no'
                                                    }
                                                    className={
                                                        form.creditEnabled ===
                                                        'no'
                                                            ? 'cursor-not-allowed'
                                                            : ''
                                                    }
                                                >
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="15">
                                                        15 dias
                                                    </SelectItem>
                                                    <SelectItem value="30">
                                                        30 dias
                                                    </SelectItem>
                                                    <SelectItem value="60">
                                                        60 dias
                                                    </SelectItem>
                                                    <SelectItem value="90">
                                                        90 dias
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TooltipTrigger>
                                    {form.creditEnabled === 'no' && (
                                        <TooltipContent>
                                            Habilite o crediário para preenchem
                                            este campo
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
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
                            {isSubmitting
                                ? isEditing
                                    ? 'Salvando...'
                                    : 'Criando...'
                                : isEditing
                                  ? 'Salvar'
                                  : 'Criar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
