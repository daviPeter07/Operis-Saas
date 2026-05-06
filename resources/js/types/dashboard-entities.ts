export type UiCustomer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    city: string;
    state: string;
    address: string;
    createdAt: string;
    creditEnabled?: boolean;
    creditLimit?: number;
    creditTermDays?: number;
    availableCredit?: number;
};

export type UiSupplier = {
    id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    city: string;
    state: string;
    address: string;
    createdAt: string;
};

export type UiProduct = {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    category: string;
    brand: string;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    createdAt: string;
};

export type UiSaleStatus = 'pending' | 'completed' | 'cancelled';
export type UiPaymentMethod =
    | 'money'
    | 'pix'
    | 'card'
    | 'crediario';

export type UiSale = {
    id: string;
    clientId: string;
    clientName: string;
    total: number;
    status: UiSaleStatus;
    paymentMethod: UiPaymentMethod;
    createdAt: string;
    items?: number;
};

export type UiPurchase = {
    id: string;
    supplierId: string;
    supplierName: string;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    paymentMethod: string;
    boletoTermDays?: string;
    dueDate?: string;
    createdAt: string;
    items?: number;
};
