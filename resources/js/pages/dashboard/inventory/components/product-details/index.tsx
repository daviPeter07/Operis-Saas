import { DetailsField, DetailsSection } from '@/components/details-page';
import {
    formatCurrencyBR,
    formatDateTimeManaus,
    formatQuantityWithUnit,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { getUnitProfit } from '../../utils/functions';
import type { ProductDetailsProps } from '../../utils/types';

export function ProductDetails({
    product,
    brandName,
    categoryName,
}: ProductDetailsProps) {
    const { profit, margin } = getUnitProfit(product);
    const stockForValue = Math.max(product.stock, 0);

    return (
        <div className="space-y-4">
            <DetailsSection title="Identificação">
                <DetailsField label="Código">{product.sku}</DetailsField>
                <DetailsField label="Código de barras">
                    {product.barcode || 'Sem código'}
                </DetailsField>
                <DetailsField label="Marca">{brandName}</DetailsField>
                <DetailsField label="Categoria">{categoryName}</DetailsField>
                <DetailsField label="Cadastrado em">
                    {product.createdAt
                        ? formatDateTimeManaus(product.createdAt)
                        : '-'}
                </DetailsField>
                <DetailsField label="Descrição" wide>
                    {product.description || (
                        <span className="font-normal text-muted-foreground">
                            Sem descrição
                        </span>
                    )}
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Preços">
                <DetailsField label="Preço de custo">
                    {formatCurrencyBR(product.cost)}
                </DetailsField>
                <DetailsField label="Preço de venda">
                    {formatCurrencyBR(product.sale_price)}
                </DetailsField>
                <DetailsField label="Lucro por unidade">
                    <span
                        className={cn(
                            profit < 0 && 'text-red-600 dark:text-red-400',
                        )}
                    >
                        {formatCurrencyBR(profit)}
                    </span>
                </DetailsField>
                <DetailsField label="Margem sobre a venda">
                    {margin.toLocaleString('pt-BR', {
                        maximumFractionDigits: 1,
                    })}
                    %
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Estoque">
                <DetailsField label="Quantidade atual">
                    <span
                        className={cn(
                            product.stock < 0 &&
                                'text-red-600 dark:text-red-400',
                        )}
                    >
                        {formatQuantityWithUnit(product.stock)}
                    </span>
                </DetailsField>
                <DetailsField label="Estoque mínimo">
                    {formatQuantityWithUnit(product.min_stock)}
                </DetailsField>
                <DetailsField label="Valor em estoque (custo)">
                    {formatCurrencyBR(product.cost * stockForValue)}
                </DetailsField>
                <DetailsField label="Valor em estoque (venda)">
                    {formatCurrencyBR(product.sale_price * stockForValue)}
                </DetailsField>
            </DetailsSection>
        </div>
    );
}
