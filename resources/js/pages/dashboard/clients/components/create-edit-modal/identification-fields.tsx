import { useFormContext } from 'react-hook-form';
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
import type { ClientFormValues } from '../../utils/types';

export function IdentificationFields() {
    const form = useFormContext<ClientFormValues>();
    const personType = form.watch('person_type');

    return (
        <>
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
                                placeholder="Nome completo ou razão social"
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
                        <FormLabel>Tipo de pessoa</FormLabel>
                        <Select
                            value={field.value}
                            onValueChange={(value) => {
                                field.onChange(value);
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
                                placeholder="cliente@empresa.com"
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
                                inputMode="tel"
                                placeholder="(00) 00000-0000"
                                {...field}
                                onChange={(event) =>
                                    field.onChange(
                                        formatPhoneInput(
                                            event.currentTarget.value,
                                        ),
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
                        <FormLabel>
                            {personType === 'pj' ? 'CNPJ' : 'CPF'}
                        </FormLabel>
                        <FormControl>
                            <Input
                                inputMode="numeric"
                                placeholder={
                                    personType === 'pj'
                                        ? '00.000.000/0000-00'
                                        : '000.000.000-00'
                                }
                                maxLength={personType === 'pj' ? 18 : 14}
                                {...field}
                                onChange={(event) =>
                                    field.onChange(
                                        formatDocumentInputByType(
                                            event.currentTarget.value,
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
        </>
    );
}
