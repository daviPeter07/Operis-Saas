import { useEffect, useMemo, useState } from 'react';
import type {
    UiCustomer,
    UiProduct,
    UiSale,
} from '@/types/dashboard-entities';
import type { SaleDiscountType, SalesLineItem } from '@/types/sales-dialog';
import { parseCurrencyInput, parsePercentInput } from '@/utils/form-fields';
import {
    buildClientFields,
    calculateCartQuantity,
    calculateCartTotal,
    calculateDiscountAmount,
    calculateFinalTotal,
    calculateProfit,
    makeSaleLineItem,
    todayString,
} from '../utils/sales-dialog';

interface UseSalesDialogArgs {
    open: boolean;
    clients: UiCustomer[];
    products: UiProduct[];
}

export function useSalesDialog({
    open,
    clients,
    products,
}: UseSalesDialogArgs) {
    const [clientId, setClientId] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [productId, setProductId] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [lineItems, setLineItems] = useState<SalesLineItem[]>([]);
    const [status, setStatus] = useState<UiSale['status']>('pending');
    const [paymentMethod, setPaymentMethod] =
        useState<UiSale['paymentMethod']>('pix');
    const [cardType, setCardType] = useState<'debit' | 'credit'>('debit');
    const [installments, setInstallments] = useState('1');
    const [crediarioEntry, setCrediarioEntry] = useState('');
    const [firstInstallmentDate, setFirstInstallmentDate] =
        useState(todayString());
    const [saleDate, setSaleDate] = useState(todayString());
    const [notes, setNotes] = useState('');
    const [discountType, setDiscountType] =
        useState<SaleDiscountType>('amount');
    const [discountValue, setDiscountValue] = useState('0');
    const [appliedDiscountType, setAppliedDiscountType] =
        useState<SaleDiscountType>('amount');
    const [appliedDiscountValue, setAppliedDiscountValue] = useState(0);
    const [discountAmountApplied, setDiscountAmountApplied] = useState(0);
    const [isScannerReady, setIsScannerReady] = useState(false);
    const [clientCreateOpen, setClientCreateOpen] = useState(false);
    const [productCreateOpen, setProductCreateOpen] = useState(false);

    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClientId('');

            setClientSearch('');

            setProductId('');

            setProductSearch('');

            setQuantity('1');

            setLineItems([]);

            setStatus('pending');

            setPaymentMethod('pix');

            setCardType('debit');

            setInstallments('1');

            setCrediarioEntry('');

            setFirstInstallmentDate(todayString());

            setSaleDate(todayString());

            setNotes('');

            setDiscountType('amount');

            setDiscountValue('');

            setAppliedDiscountType('amount');

            setAppliedDiscountValue(0);

            setDiscountAmountApplied(0);

            setIsScannerReady(false);
        }
    }, [open]);

    const selectedClient = useMemo(
        () => clients.find((client) => client.id === clientId),
        [clientId, clients],
    );

    const selectedProduct = useMemo(
        () => products.find((product) => product.id === productId),
        [productId, products],
    );

    const total = useMemo(() => calculateCartTotal(lineItems), [lineItems]);
    const finalTotal = useMemo(
        () => calculateFinalTotal(total, discountAmountApplied),
        [discountAmountApplied, total],
    );
    const itemsCount = useMemo(
        () => calculateCartQuantity(lineItems),
        [lineItems],
    );
    const estimatedProfit = useMemo(
        () => calculateProfit(lineItems, finalTotal),
        [lineItems, finalTotal],
    );
    const clientQuickFields = useMemo(
        () => buildClientFields(clients),
        [clients],
    );

    const selectClientById = (value: string) => {
        const nextClient = clients.find((client) => client.id === value);

        setClientId(value);
        setClientSearch(nextClient?.name || '');
    };

    const selectProductById = (value: string) => {
        const nextProduct = products.find((product) => product.id === value);

        setProductId(value);
        setProductSearch(nextProduct?.name || '');
    };

    const addSelectedProduct = () => {
        if (!selectedProduct) {
            return;
        }

        const quantityValue = Math.max(1, Number(quantity) || 1);
        const selectedUnitPrice = selectedProduct.price;

        setLineItems((currentItems) => {
            const existingIndex = currentItems.findIndex(
                (item) =>
                    item.productId === selectedProduct.id &&
                    item.unitPrice === selectedUnitPrice,
            );

            if (existingIndex >= 0) {
                const nextItems = [...currentItems];
                const currentItem = nextItems[existingIndex];
                const nextQuantity = currentItem.quantity + quantityValue;

                nextItems[existingIndex] = {
                    ...currentItem,
                    quantity: nextQuantity,
                    subtotal: Number(
                        (currentItem.unitPrice * nextQuantity).toFixed(2),
                    ),
                };

                return nextItems;
            }

            return [
                ...currentItems,
                makeSaleLineItem(
                    selectedProduct,
                    quantityValue,
                    selectedUnitPrice,
                ),
            ];
        });

        setProductId('');
        setProductSearch('');
        setQuantity('1');
        setIsScannerReady(false);
    };

    const addProductToCart = (
        product: UiProduct,
        customQuantity: number,
        customSalePrice: number,
    ) => {
        const quantityValue = Math.max(1, Number(customQuantity) || 1);
        const salePrice = Math.max(0, Number(customSalePrice) || 0);

        setLineItems((currentItems) => {
            const existingIndex = currentItems.findIndex(
                (item) =>
                    item.productId === product.id &&
                    item.unitPrice === salePrice,
            );

            if (existingIndex >= 0) {
                const nextItems = [...currentItems];
                const currentItem = nextItems[existingIndex];
                const nextQuantity = currentItem.quantity + quantityValue;

                nextItems[existingIndex] = {
                    ...currentItem,
                    quantity: nextQuantity,
                    subtotal: Number(
                        (currentItem.unitPrice * nextQuantity).toFixed(2),
                    ),
                };

                return nextItems;
            }

            return [
                ...currentItems,
                makeSaleLineItem(product, quantityValue, salePrice),
            ];
        });
    };

    const updateLineItemQuantity = (itemId: string, value: string) => {
        const quantityValue = Math.max(1, Number(value) || 1);

        setLineItems((currentItems) =>
            currentItems.map((item) =>
                item.id === itemId
                    ? {
                          ...item,
                          quantity: quantityValue,
                          subtotal: Number(
                              (item.unitPrice * quantityValue).toFixed(2),
                          ),
                      }
                    : item,
            ),
        );
    };

    const increaseLineItemQuantity = (itemId: string) => {
        setLineItems((currentItems) =>
            currentItems.map((item) => {
                if (item.id !== itemId) {
                    return item;
                }

                const nextQuantity = item.quantity + 1;

                return {
                    ...item,
                    quantity: nextQuantity,
                    subtotal: Number(
                        (item.unitPrice * nextQuantity).toFixed(2),
                    ),
                };
            }),
        );
    };

    const decreaseLineItemQuantity = (itemId: string) => {
        setLineItems((currentItems) =>
            currentItems.flatMap((item) => {
                if (item.id !== itemId) {
                    return [item];
                }

                const nextQuantity = item.quantity - 1;

                if (nextQuantity <= 0) {
                    return [];
                }

                return [
                    {
                        ...item,
                        quantity: nextQuantity,
                        subtotal: Number(
                            (item.unitPrice * nextQuantity).toFixed(2),
                        ),
                    },
                ];
            }),
        );
    };

    const removeLineItem = (itemId: string) => {
        setLineItems((currentItems) =>
            currentItems.filter((item) => item.id !== itemId),
        );
    };

    const applyDiscount = () => {
        const safeValue =
            discountType === 'amount'
                ? parseCurrencyInput(discountValue)
                : parsePercentInput(discountValue);
        const amount = calculateDiscountAmount(total, discountType, safeValue);

        setAppliedDiscountType(discountType);
        setAppliedDiscountValue(safeValue);
        setDiscountAmountApplied(amount);
    };

    const canSubmit = Boolean(selectedClient && lineItems.length > 0);

    return {
        addSelectedProduct,
        addProductToCart,
        applyDiscount,
        appliedDiscountType,
        appliedDiscountValue,
        canSubmit,
        clientCreateOpen,
        clientId,
        clientQuickFields,
        clientSearch,
        discountAmountApplied,
        discountType,
        discountValue,
        decreaseLineItemQuantity,
        estimatedProfit,
        finalTotal,
        increaseLineItemQuantity,
        itemsCount,
        isScannerReady,
        lineItems,
        notes,
        paymentMethod,
        cardType,
        installments,
        crediarioEntry,
        firstInstallmentDate,
        productCreateOpen,
        productId,
        productSearch,
        quantity,
        saleDate,
        selectedClient,
        selectedProduct,
        status,
        total,
        removeLineItem,
        selectClientById,
        selectProductById,
        setClientCreateOpen,
        setClientId,
        setClientSearch,
        setDiscountType,
        setDiscountValue,
        setIsScannerReady,
        setLineItems,
        setNotes,
        setPaymentMethod,
        setCardType,
        setInstallments,
        setCrediarioEntry,
        setFirstInstallmentDate,
        setProductCreateOpen,
        setProductId,
        setProductSearch,
        setQuantity,
        setSaleDate,
        setStatus,
        updateLineItemQuantity,
    };
}
