import { Barcode, Plus, Sparkles } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { SearchableSelect } from '@/components/searchable-select';
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
import { Textarea } from '@/components/ui/textarea';
import { QuickCreateDialog } from '@/features/dashboard/sales/quick-create-dialog';
import { cn } from '@/lib/utils';
import type { Brand } from '@/schemas/brand';
import type { Category } from '@/schemas/category';
import {
    applyFieldMask,
    generateEan13Code,
    generateInternalCode,
    parseMaskedFieldValue,
} from '@/utils/form-fields';

type ProductDialogMode = 'create' | 'edit';

type ProductDialogForm = {
    id?: number;
    name: string;
    sku: string;
    barcode: string;
    cost: string;
    sale_price: string;
    stock: string;
    min_stock: string;
    category_id: string;
    brand_id: string;
    description: string;
};

type ProductDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: ProductDialogMode;
    initialData?: Partial<ProductDialogForm>;
    brands: Array<{ value: string; label: string }>;
    categories: Array<{ value: string; label: string }>;
    onCreateBrand: (name: string) => Promise<Brand>;
    onCreateCategory: (name: string) => Promise<Category>;
    onSubmit: (data: {
        id?: number;
        name: string;
        sku: string;
        barcode: string | null;
        description: string | null;
        sale_price: number;
        cost: number;
        stock: number;
        min_stock: number;
        category_id: number;
        brand_id: number | null;
    }) => Promise<void>;
};

const STOCK_STEPS = [-10, -1, 1, 10] as const;

function makeEmptyForm(): ProductDialogForm {
    return {
        name: '',
        sku: '',
        barcode: '',
        cost: '',
        sale_price: '',
        stock: '0',
        min_stock: '0',
        category_id: '',
        brand_id: '',
        description: '',
    };
}

function normalizeInitialData(
    initialData?: Partial<ProductDialogForm>,
): ProductDialogForm {
    return {
        ...makeEmptyForm(),
        ...initialData,
        id: initialData?.id,
        stock: String(initialData?.stock ?? '0'),
        min_stock: String(initialData?.min_stock ?? '0'),
    };
}

export function ProductDialog({
    open,
    onOpenChange,
    mode,
    initialData,
    brands,
    categories,
    onCreateBrand,
    onCreateCategory,
    onSubmit,
}: ProductDialogProps) {
    const [formData, setFormData] = React.useState<ProductDialogForm>(
        normalizeInitialData(initialData),
    );
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isBrandCreateOpen, setIsBrandCreateOpen] = React.useState(false);
    const [isCategoryCreateOpen, setIsCategoryCreateOpen] = React.useState(false);
    const barcodeInputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        if (open) {
            queueMicrotask(() =>
                setFormData(normalizeInitialData(initialData)),
            );
        }
    }, [initialData, open]);

    const isValid =
        formData.name.trim().length > 0 &&
        formData.sku.trim().length > 0 &&
        formData.cost.trim().length > 0 &&
        formData.sale_price.trim().length > 0 &&
        formData.category_id.trim().length > 0;

    const setField = <K extends keyof ProductDialogForm>(
        key: K,
        value: ProductDialogForm[K],
    ) => {
        setFormData((current) => ({ ...current, [key]: value }));
    };

    const adjustStock = (delta: number) => {
        setFormData((current) => ({
            ...current,
            stock: String(Math.max(0, Number(current.stock || 0) + delta)),
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!isValid) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit({
                id: formData.id,
                name: formData.name.trim(),
                sku: formData.sku.trim(),
                barcode: formData.barcode.trim() || null,
                description: formData.description.trim() || null,
                sale_price: Number(
                    parseMaskedFieldValue(formData.sale_price, 'currency'),
                ),
                cost: Number(parseMaskedFieldValue(formData.cost, 'currency')),
                stock: Math.max(0, Number(formData.stock || 0)),
                min_stock: Math.max(0, Number(formData.min_stock || 0)),
                category_id: Number(formData.category_id),
                brand_id: formData.brand_id ? Number(formData.brand_id) : null,
            });
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = mode === 'create' ? 'Novo produto' : 'Editar produto';
    const description =
        mode === 'create'
            ? 'Cadastre um produto com dados comerciais e de estoque.'
            : 'Atualize os dados comerciais e de estoque do produto.';
    const submitLabel =
        mode === 'create' ? 'Criar produto' : 'Salvar alterações';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[980px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="product-name">Nome do produto</Label>
                            <Input
                                id="product-name"
                                placeholder="Ex.: Monitor gamer 24 polegadas"
                                value={formData.name}
                                onChange={(event) =>
                                    setField('name', event.currentTarget.value)
                                }
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="product-category">Categoria</Label>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                                <SearchableSelect
                                    value={formData.category_id}
                                    onChange={(value) =>
                                        setField('category_id', value)
                                    }
                                    options={categories}
                                    placeholder="Selecione uma categoria"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCategoryCreateOpen(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="product-sku">Código interno</Label>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                                <Input
                                    id="product-sku"
                                    placeholder="Ex.: MON-24-0001"
                                    value={formData.sku}
                                    onChange={(event) =>
                                        setField(
                                            'sku',
                                            event.currentTarget.value,
                                        )
                                    }
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setField(
                                            'sku',
                                            generateInternalCode(
                                                formData.name,
                                                brands.find(
                                                    (brand) =>
                                                        brand.value ===
                                                        formData.brand_id,
                                                )?.label || '',
                                            ),
                                        )
                                    }
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Gerar
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="product-brand">Marca</Label>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                                <SearchableSelect
                                    value={formData.brand_id}
                                    onChange={(value) =>
                                        setField('brand_id', value)
                                    }
                                    options={brands}
                                    placeholder="Selecione uma marca"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsBrandCreateOpen(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="product-barcode">Código de barras</Label>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
                                <Input
                                    id="product-barcode"
                                    ref={barcodeInputRef}
                                    placeholder="Ex.: 7890000000000"
                                    value={formData.barcode}
                                    onChange={(event) =>
                                        setField(
                                            'barcode',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setField('barcode', generateEan13Code())
                                    }
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Gerar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        barcodeInputRef.current?.focus();
                                        toast.info(
                                            'Campo pronto para leitura por scanner',
                                        );
                                    }}
                                >
                                    <Barcode className="mr-2 h-4 w-4" />
                                    Ler
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="product-cost">Preço de custo</Label>
                            <Input
                                id="product-cost"
                                type="text"
                                inputMode="numeric"
                                placeholder="R$ 0,00"
                                value={formData.cost}
                                onChange={(event) =>
                                    setField(
                                        'cost',
                                        applyFieldMask(
                                            event.currentTarget.value,
                                            'currency',
                                        ),
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="product-sale-price">
                                Preço de venda
                            </Label>
                            <Input
                                id="product-sale-price"
                                type="text"
                                inputMode="numeric"
                                placeholder="R$ 0,00"
                                value={formData.sale_price}
                                onChange={(event) =>
                                    setField(
                                        'sale_price',
                                        applyFieldMask(
                                            event.currentTarget.value,
                                            'currency',
                                        ),
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="product-stock">Estoque inicial</Label>
                            <div className="space-y-2 rounded-lg border p-3">
                                <Input
                                    id="product-stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="0"
                                    value={formData.stock}
                                    onChange={(event) =>
                                        setField(
                                            'stock',
                                            String(
                                                Math.max(
                                                    0,
                                                    Number(
                                                        event.currentTarget
                                                            .value || 0,
                                                    ),
                                                ),
                                            ),
                                        )
                                    }
                                    required
                                />
                                <div className="grid grid-cols-4 gap-2">
                                    {STOCK_STEPS.map((step) => (
                                        <Button
                                            key={step}
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                step > 0 &&
                                                    'border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
                                                step < 0 &&
                                                    'border-amber-500/30 text-amber-700 dark:text-amber-300',
                                            )}
                                            onClick={() => adjustStock(step)}
                                        >
                                            {step > 0 ? `+${step}` : step}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="product-min-stock">
                                Estoque mínimo
                            </Label>
                            <Input
                                id="product-min-stock"
                                type="number"
                                min="0"
                                step="1"
                                placeholder="0"
                                value={formData.min_stock}
                                onChange={(event) =>
                                    setField(
                                        'min_stock',
                                        String(
                                            Math.max(
                                                0,
                                                Number(
                                                    event.currentTarget.value ||
                                                        0,
                                                ),
                                            ),
                                        ),
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="product-description">Descrição</Label>
                            <Textarea
                                id="product-description"
                                placeholder="Descreva o produto, diferenciais ou observações internas"
                                value={formData.description}
                                onChange={(event) =>
                                    setField(
                                        'description',
                                        event.currentTarget.value,
                                    )
                                }
                                className="min-h-28 resize-none"
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
                        <Button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                        >
                            {isSubmitting ? 'Salvando...' : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>

                <QuickCreateDialog<Brand>
                    open={isBrandCreateOpen}
                    onOpenChange={setIsBrandCreateOpen}
                    title="Nova marca"
                    description="Cadastre uma nova marca sem sair do produto."
                    submitLabel="Criar marca"
                    keepOpenAfterSubmit={false}
                    fields={[
                        {
                            name: 'name',
                            label: 'Nome',
                            type: 'text',
                            required: true,
                            placeholder: 'Digite o nome da marca',
                        },
                    ]}
                    onSubmit={async (data) => onCreateBrand(data.name)}
                    onCreated={(brand) => {
                        setField('brand_id', String(brand.id));
                        toast.success('Marca criada com sucesso.');
                    }}
                />

                <QuickCreateDialog<Category>
                    open={isCategoryCreateOpen}
                    onOpenChange={setIsCategoryCreateOpen}
                    title="Nova categoria"
                    description="Cadastre uma nova categoria sem sair do produto."
                    submitLabel="Criar categoria"
                    keepOpenAfterSubmit={false}
                    fields={[
                        {
                            name: 'name',
                            label: 'Nome',
                            type: 'text',
                            required: true,
                            placeholder: 'Digite o nome da categoria',
                        },
                    ]}
                    onSubmit={async (data) => onCreateCategory(data.name)}
                    onCreated={(category) => {
                        setField('category_id', String(category.id));
                        toast.success('Categoria criada com sucesso.');
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
