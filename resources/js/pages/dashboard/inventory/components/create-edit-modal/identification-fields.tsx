import { Barcode, Sparkles } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { InputSearchComplete } from '@/components/input-search-complete';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { generateEan13Code, generateInternalCode } from '@/utils/form-fields';
import { findOptionLabel } from '../../utils/functions';
import type {
    IdentificationFieldsProps,
    ProductDialogForm,
    QuickCreateType,
} from '../../utils/types';
import { QuickCreateButton } from './quick-create-button';

export function IdentificationFields({
    brands,
    categories,
    onQuickCreate,
}: IdentificationFieldsProps) {
    const form = useFormContext<ProductDialogForm>();
    const quickCreate = (type: QuickCreateType) => () => onQuickCreate(type);

    return (
        <>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Nome do produto <RequiredMark />
                        </FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Ex.: Monitor gamer 24 polegadas"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="category_id"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <div className="flex items-center justify-between gap-2">
                            <FormLabel>
                                Categoria <RequiredMark />
                            </FormLabel>
                            <QuickCreateButton
                                label="Criar categoria"
                                onClick={quickCreate('category')}
                            />
                        </div>
                        <FormControl>
                            <InputSearchComplete
                                value={field.value}
                                onChange={field.onChange}
                                options={categories}
                                placeholder="Digite ou escolha uma categoria"
                                emptyMessage="Nenhuma categoria encontrada."
                                invalid={Boolean(fieldState.error)}
                                onCreateOption={(name) =>
                                    onQuickCreate('category', name)
                                }
                                createOptionLabel={(name) =>
                                    `Criar categoria "${name}"`
                                }
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Código interno <RequiredMark />
                        </FormLabel>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                            <FormControl>
                                <Input
                                    placeholder="Ex.: MON-24-0001"
                                    {...field}
                                />
                            </FormControl>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    form.setValue(
                                        'sku',
                                        generateInternalCode(
                                            form.getValues('name'),
                                            findOptionLabel(
                                                brands,
                                                form.getValues('brand_id'),
                                            ),
                                        ),
                                        { shouldValidate: true },
                                    )
                                }
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Gerar
                            </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="brand_id"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <div className="flex items-center justify-between gap-2">
                            <FormLabel>
                                Marca <RequiredMark />
                            </FormLabel>
                            <QuickCreateButton
                                label="Criar marca"
                                onClick={quickCreate('brand')}
                            />
                        </div>
                        <FormControl>
                            <InputSearchComplete
                                value={field.value}
                                onChange={field.onChange}
                                options={brands}
                                placeholder="Digite ou escolha uma marca"
                                emptyMessage="Nenhuma marca encontrada."
                                invalid={Boolean(fieldState.error)}
                                onCreateOption={(name) =>
                                    onQuickCreate('brand', name)
                                }
                                createOptionLabel={(name) =>
                                    `Criar marca "${name}"`
                                }
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                        <FormLabel>Código de barras</FormLabel>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
                            <FormControl>
                                <Input
                                    placeholder="Ex.: 7890000000000"
                                    {...field}
                                />
                            </FormControl>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    form.setValue(
                                        'barcode',
                                        generateEan13Code(),
                                    )
                                }
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Gerar
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    form.setFocus('barcode');
                                    toast.info(
                                        'Campo pronto para leitura por scanner',
                                    );
                                }}
                            >
                                <Barcode className="mr-2 h-4 w-4" />
                                Ler
                            </Button>
                        </div>
                    </FormItem>
                )}
            />
        </>
    );
}
