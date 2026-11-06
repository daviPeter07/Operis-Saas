import { useFormContext, useWatch } from 'react-hook-form';
import { RequiredMark } from '@/components/required-mark';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PERSON_TYPE_OPTIONS } from '@/constants/person-type';
import {
    formatDocumentInputByType,
    formatPhoneInput,
} from '@/utils/form-fields';
import { DOCUMENT_FIELD } from '../../utils/constants';
import type { PersonType, SupplierFormValues } from '../../utils/types';

export function SupplierFields() {
    const form = useFormContext<SupplierFormValues>();
    const personType = useWatch({
        control: form.control,
        name: 'person_type',
    });
    const documentField = DOCUMENT_FIELD[personType];

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Nome <RequiredMark />
                        </FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Razão social ou nome fantasia"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="person_type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Tipo de pessoa <RequiredMark />
                        </FormLabel>
                        <Select
                            value={field.value}
                            onValueChange={(value) => {
                                field.onChange(value as PersonType);
                                form.setValue('document', '', {
                                    shouldValidate: true,
                                });
                            }}
                        >
                            <FormControl>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                            </FormControl>
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
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                            <Input
                                type="email"
                                placeholder="contato@fornecedor.com"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="(00) 00000-0000"
                                {...field}
                                onChange={(event) =>
                                    field.onChange(
                                        formatPhoneInput(event.target.value),
                                    )
                                }
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                        <FormLabel>{documentField.label}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder={documentField.placeholder}
                                maxLength={documentField.maxLength}
                                {...field}
                                onChange={(event) =>
                                    field.onChange(
                                        formatDocumentInputByType(
                                            event.target.value,
                                            personType,
                                        ),
                                    )
                                }
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
