import { useEffect, useMemo, useState } from 'react';
import type { Client, Product, Sale } from '@/lib/mocks/mock-data';
import type { SalesLineItem } from '@/types/sales-dialog';
import {
    buildClientFields,
    buildProductFields,
    calculateCartQuantity,
    calculateCartTotal,
    calculateProfit,
    makeSaleLineItem,
    todayString,
} from '../utils/sales-dialog';

interface UseSalesDialogArgs {
    open: boolean;
    clients: Client[];
    products: Product[];
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
    const [status, setStatus] = useState<Sale['status']>('pending');
    const [paymentMethod, setPaymentMethod] =
        useState<Sale['paymentMethod']>('pix');
    const [saleDate, setSaleDate] = useState(todayString());
    const [notes, setNotes] = useState('');
    const [isScannerReady, setIsScannerReady] = useState(false);
    const [clientCreateOpen, setClientCreateOpen] = useState(false);
    const [productCreateOpen, setProductCreateOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setClientId('');
            setClientSearch('');
            setProductId('');
            setProductSearch('');
            setQuantity('1');
            setLineItems([]);
            setStatus('pending');
            setPaymentMethod('pix');
            setSaleDate(todayString());
            setNotes('');
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
    const itemsCount = useMemo(
        () => calculateCartQuantity(lineItems),
        [lineItems],
    );
    const estimatedProfit = useMemo(
        () => calculateProfit(lineItems, total),
        [lineItems, total],
    );
    const clientQuickFields = useMemo(
        () => buildClientFields(clients),
        [clients],
    );
    const productQuickFields = useMemo(
        () => buildProductFields(products),
        [products],
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

        setLineItems((currentItems) => {
            const existingIndex = currentItems.findIndex(
                (item) => item.productId === selectedProduct.id,
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
                makeSaleLineItem(selectedProduct, quantityValue),
            ];
        });

        setProductId('');
        setProductSearch('');
        setQuantity('1');
        setIsScannerReady(false);
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

    const removeLineItem = (itemId: string) => {
        setLineItems((currentItems) =>
            currentItems.filter((item) => item.id !== itemId),
        );
    };

    const canSubmit = Boolean(selectedClient && lineItems.length > 0);

    return {
        addSelectedProduct,
        canSubmit,
        clientCreateOpen,
        clientId,
        clientQuickFields,
        clientSearch,
        estimatedProfit,
        itemsCount,
        isScannerReady,
        lineItems,
        notes,
        paymentMethod,
        productCreateOpen,
        productId,
        productQuickFields,
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
        setIsScannerReady,
        setLineItems,
        setNotes,
        setPaymentMethod,
        setProductCreateOpen,
        setProductId,
        setProductSearch,
        setQuantity,
        setSaleDate,
        setStatus,
        updateLineItemQuantity,
    };
}
