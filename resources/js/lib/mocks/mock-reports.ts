export interface SalesReport {
    id: string;
    date: string;
    client: string;
    product: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface TopProductsReport {
    id: string;
    product: string;
    sku: string;
    quantitySold: number;
    revenue: number;
}

export interface SalesByCategoryReport {
    id: string;
    category: string;
    productsSold: number;
    revenue: number;
}

export interface SalesByBrandReport {
    id: string;
    brand: string;
    productsSold: number;
    revenue: number;
}

export interface StockReport {
    id: string;
    product: string;
    sku: string;
    currentStock: number;
    minStock: number;
    cost: number;
    salePrice: number;
    profitMargin: number;
}

export interface StockByBrandReport {
    id: string;
    brand: string;
    totalUnits: number;
    totalCost: number;
    totalSaleValue: number;
    estimatedProfit: number;
}

export interface ExpiringReport {
    id: string;
    product: string;
    sku: string;
    expiryDate: string;
    daysUntilExpiry: number;
    currentStock: number;
}

export interface LossesReport {
    id: string;
    date: string;
    product: string;
    quantity: number;
    reason: 'expired' | 'damaged' | 'lost' | 'other';
    cost: number;
}

export interface ClientDebtReport {
    id: string;
    client: string;
    email: string;
    totalDebt: number;
    overdueInstallments: number;
    lastPurchase: string;
}

export interface PaymentMethodReport {
    id: string;
    paymentMethod: string;
    transactions: number;
    totalAmount: number;
}

export interface TopClientsReport {
    id: string;
    client: string;
    email: string;
    totalPurchases: number;
    totalSpent: number;
}

export interface ClientsByCityReport {
    id: string;
    city: string;
    state: string;
    clientCount: number;
    totalSpent: number;
}

export const mockSalesReport: SalesReport[] = [
    {
        id: '1',
        date: '2024-06-01',
        client: 'João Silva',
        product: 'Smartphone Samsung Galaxy',
        quantity: 1,
        unitPrice: 2999.99,
        total: 2999.99,
    },
    {
        id: '2',
        date: '2024-06-02',
        client: 'Maria Santos',
        product: 'Notebook Dell Inspiron',
        quantity: 1,
        unitPrice: 4599.99,
        total: 4599.99,
    },
    {
        id: '3',
        date: '2024-06-03',
        client: 'Carlos Oliveira',
        product: 'Fone Bluetooth JBL',
        quantity: 2,
        unitPrice: 299.99,
        total: 599.98,
    },
    {
        id: '4',
        date: '2024-06-03',
        client: 'Carlos Oliveira',
        product: 'Pen Drive 128GB',
        quantity: 1,
        unitPrice: 59.99,
        total: 59.99,
    },
    {
        id: '5',
        date: '2024-06-04',
        client: 'Ana Ferreira',
        product: 'Monitor 24" Full HD',
        quantity: 2,
        unitPrice: 999.99,
        total: 1999.98,
    },
    {
        id: '6',
        date: '2024-06-05',
        client: 'Pedro Costa',
        product: 'Roteador WiFi 6',
        quantity: 1,
        unitPrice: 599.99,
        total: 599.99,
    },
    {
        id: '7',
        date: '2024-06-06',
        client: 'João Silva',
        product: 'Smartwatch Galaxy Watch',
        quantity: 1,
        unitPrice: 1599.99,
        total: 1599.99,
    },
    {
        id: '8',
        date: '2024-06-07',
        client: 'Lucia Mendes',
        product: 'Fone Ouvido Premium',
        quantity: 1,
        unitPrice: 899.99,
        total: 899.99,
    },
    {
        id: '9',
        date: '2024-06-08',
        client: 'Fernanda Lima',
        product: 'Tablet Samsung Tab S9',
        quantity: 1,
        unitPrice: 3299.99,
        total: 3299.99,
    },
    {
        id: '10',
        date: '2024-06-09',
        client: 'Fernanda Lima',
        product: 'Capinha Protetora',
        quantity: 2,
        unitPrice: 49.99,
        total: 99.99,
    },
];

export const mockTopProductsReport: TopProductsReport[] = [
    {
        id: '1',
        product: 'Smartphone Samsung Galaxy',
        sku: 'SMG-S24',
        quantitySold: 45,
        revenue: 134999.55,
    },
    {
        id: '2',
        product: 'Notebook Dell Inspiron',
        sku: 'DELL-INS-15',
        quantitySold: 28,
        revenue: 128799.72,
    },
    {
        id: '3',
        product: 'Fone Bluetooth JBL',
        sku: 'JBL-TUNE-500',
        quantitySold: 89,
        revenue: 26699.11,
    },
    {
        id: '4',
        product: 'Smartwatch Galaxy Watch',
        sku: 'SMW-GW-6',
        quantitySold: 34,
        revenue: 54399.66,
    },
    {
        id: '5',
        product: 'SSD 512GB NVMe',
        sku: 'SSD-512-NVM',
        quantitySold: 67,
        revenue: 26799.33,
    },
    {
        id: '6',
        product: 'Caixa de Som Portátil',
        sku: 'CSP-BT-360',
        quantitySold: 23,
        revenue: 16099.77,
    },
    {
        id: '7',
        product: 'Teclado Mecânico RGB',
        sku: 'RGB-TKL-001',
        quantitySold: 42,
        revenue: 19319.58,
    },
    {
        id: '8',
        product: 'Monitor 24" Full HD',
        sku: 'MON-24-FHD',
        quantitySold: 18,
        revenue: 17999.82,
    },
    {
        id: '9',
        product: 'Pen Drive 128GB',
        sku: 'PFD-128-USB3',
        quantitySold: 156,
        revenue: 9358.44,
    },
    {
        id: '10',
        product: 'Hub USB-C 7 Portas',
        sku: 'HUB-USBC-7',
        quantitySold: 78,
        revenue: 15599.22,
    },
];

export const mockSalesByCategoryReport: SalesByCategoryReport[] = [
    { id: '1', category: 'Eletrônicos', productsSold: 156, revenue: 489999.45 },
    { id: '2', category: 'Periféricos', productsSold: 234, revenue: 67899.12 },
    { id: '3', category: 'Áudio', productsSold: 112, revenue: 42798.88 },
    { id: '4', category: 'Acessórios', productsSold: 345, revenue: 23456.78 },
    {
        id: '5',
        category: 'Armazenamento',
        productsSold: 223,
        revenue: 36157.77,
    },
    { id: '6', category: 'Wearables', productsSold: 34, revenue: 54399.66 },
    { id: '7', category: 'Redes', productsSold: 45, revenue: 26999.55 },
    { id: '8', category: 'Escritório', productsSold: 28, revenue: 16799.72 },
];

export const mockSalesByBrandReport: SalesByBrandReport[] = [
    { id: '1', brand: 'Samsung', productsSold: 178, revenue: 334998.21 },
    { id: '2', brand: 'Logitech', productsSold: 234, revenue: 56789.34 },
    { id: '3', brand: 'JBL', productsSold: 112, revenue: 33598.88 },
    { id: '4', brand: 'Dell', productsSold: 28, revenue: 128799.72 },
    { id: '5', brand: 'Lenovo', productsSold: 15, revenue: 79499.85 },
    { id: '6', brand: 'Sony', productsSold: 23, revenue: 20699.77 },
    { id: '7', brand: 'LG', productsSold: 18, revenue: 17999.82 },
    { id: '8', brand: 'Redragon', productsSold: 42, revenue: 19319.58 },
    { id: '9', brand: 'Razer', productsSold: 19, revenue: 2469.81 },
    { id: '10', brand: 'Apple', productsSold: 12, revenue: 1799.88 },
];

export const mockStockReport: StockReport[] = [
    {
        id: '1',
        product: 'Smartphone Samsung Galaxy',
        sku: 'SMG-S24',
        currentStock: 45,
        minStock: 10,
        cost: 1800,
        salePrice: 2999.99,
        profitMargin: 40,
    },
    {
        id: '2',
        product: 'Notebook Dell Inspiron',
        sku: 'DELL-INS-15',
        currentStock: 12,
        minStock: 5,
        cost: 3200,
        salePrice: 4599.99,
        profitMargin: 30,
    },
    {
        id: '3',
        product: 'Fone Bluetooth JBL',
        sku: 'JBL-TUNE-500',
        currentStock: 78,
        minStock: 20,
        cost: 150,
        salePrice: 299.99,
        profitMargin: 50,
    },
    {
        id: '4',
        product: 'Mouse Sem Fio Logitech',
        sku: 'LOG-M220',
        currentStock: 156,
        minStock: 30,
        cost: 45,
        salePrice: 89.99,
        profitMargin: 50,
    },
    {
        id: '5',
        product: 'Teclado Mecânico RGB',
        sku: 'RGB-TKL-001',
        currentStock: 34,
        minStock: 15,
        cost: 250,
        salePrice: 459.99,
        profitMargin: 46,
    },
    {
        id: '6',
        product: 'Monitor 24" Full HD',
        sku: 'MON-24-FHD',
        currentStock: 8,
        minStock: 5,
        cost: 650,
        salePrice: 999.99,
        profitMargin: 35,
    },
    {
        id: '7',
        product: 'Webcam HD 1080p',
        sku: 'WC-HD-1080',
        currentStock: 23,
        minStock: 10,
        cost: 180,
        salePrice: 299.99,
        profitMargin: 40,
    },
    {
        id: '8',
        product: 'Carregador Turbo USB-C',
        sku: 'CHG-TB-65W',
        currentStock: 89,
        minStock: 25,
        cost: 75,
        salePrice: 149.99,
        profitMargin: 50,
    },
    {
        id: '9',
        product: 'SSD 512GB NVMe',
        sku: 'SSD-512-NVM',
        currentStock: 42,
        minStock: 15,
        cost: 280,
        salePrice: 399.99,
        profitMargin: 30,
    },
    {
        id: '10',
        product: 'HD Externo 1TB',
        sku: 'HDE-1TB-USB3',
        currentStock: 28,
        minStock: 10,
        cost: 180,
        salePrice: 299.99,
        profitMargin: 40,
    },
];

export const mockStockByBrandReport: StockByBrandReport[] = [
    {
        id: '1',
        brand: 'Samsung',
        totalUnits: 167,
        totalCost: 168500,
        totalSaleValue: 278950,
        estimatedProfit: 110450,
    },
    {
        id: '2',
        brand: 'Logitech',
        totalUnits: 234,
        totalCost: 18900,
        totalSaleValue: 37800,
        estimatedProfit: 18900,
    },
    {
        id: '3',
        brand: 'Dell',
        totalUnits: 12,
        totalCost: 38400,
        totalSaleValue: 55199.88,
        estimatedProfit: 16799.88,
    },
    {
        id: '4',
        brand: 'JBL',
        totalUnits: 78,
        totalCost: 11700,
        totalSaleValue: 23399.22,
        estimatedProfit: 11699.22,
    },
    {
        id: '5',
        brand: 'Lenovo',
        totalUnits: 9,
        totalCost: 32400,
        totalSaleValue: 47699.91,
        estimatedProfit: 15299.91,
    },
    {
        id: '6',
        brand: 'Sony',
        totalUnits: 11,
        totalCost: 5720,
        totalSaleValue: 9899.89,
        estimatedProfit: 4179.89,
    },
    {
        id: '7',
        brand: 'LG',
        totalUnits: 8,
        totalCost: 5200,
        totalSaleValue: 7999.92,
        estimatedProfit: 2799.92,
    },
    {
        id: '8',
        brand: 'Redragon',
        totalUnits: 34,
        totalCost: 8500,
        totalSaleValue: 15639.66,
        estimatedProfit: 7139.66,
    },
    {
        id: '9',
        brand: 'Razer',
        totalUnits: 19,
        totalCost: 1045,
        totalSaleValue: 2469.81,
        estimatedProfit: 1424.81,
    },
    {
        id: '10',
        brand: 'Apple',
        totalUnits: 89,
        totalCost: 5785,
        totalSaleValue: 13349.11,
        estimatedProfit: 7564.11,
    },
];

export const mockExpiringReport: ExpiringReport[] = [
    {
        id: '1',
        product: 'Película de Vidro',
        sku: 'PEL-VID-001',
        expiryDate: '2024-07-01',
        daysUntilExpiry: 7,
        currentStock: 45,
    },
    {
        id: '2',
        product: 'Capinha silicone',
        sku: 'CAP-SIL-002',
        expiryDate: '2024-07-05',
        daysUntilExpiry: 11,
        currentStock: 78,
    },
    {
        id: '3',
        product: 'Cabo USB-C',
        sku: 'USB-C-1M',
        expiryDate: '2024-07-10',
        daysUntilExpiry: 16,
        currentStock: 120,
    },
    {
        id: '4',
        product: 'Fone esportivo',
        sku: 'FONE-ESP-001',
        expiryDate: '2024-07-15',
        daysUntilExpiry: 21,
        currentStock: 34,
    },
    {
        id: '5',
        product: 'Suporte celular',
        sku: 'SUP-CEL-001',
        expiryDate: '2024-07-20',
        daysUntilExpiry: 26,
        currentStock: 56,
    },
];

export const mockLossesReport: LossesReport[] = [
    {
        id: '1',
        date: '2024-06-01',
        product: 'Película de Vidro',
        quantity: 5,
        reason: 'expired',
        cost: 75,
    },
    {
        id: '2',
        date: '2024-06-05',
        product: 'Capinha silicone',
        quantity: 3,
        reason: 'damaged',
        cost: 45,
    },
    {
        id: '3',
        date: '2024-06-10',
        product: 'Fone esportivo',
        quantity: 2,
        reason: 'lost',
        cost: 60,
    },
    {
        id: '4',
        date: '2024-06-15',
        product: 'Cabo USB-C',
        quantity: 8,
        reason: 'expired',
        cost: 280,
    },
    {
        id: '5',
        date: '2024-06-20',
        product: 'Suporte celular',
        quantity: 1,
        reason: 'damaged',
        cost: 25,
    },
    {
        id: '6',
        date: '2024-06-25',
        product: 'Mouse pad',
        quantity: 4,
        reason: 'other',
        cost: 52,
    },
];

export const mockClientDebtReport: ClientDebtReport[] = [
    {
        id: '1',
        client: 'Ana Ferreira',
        email: 'ana.ferreira@email.com',
        totalDebt: 2399.97,
        overdueInstallments: 2,
        lastPurchase: '2024-06-04',
    },
    {
        id: '2',
        client: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        totalDebt: 1599.99,
        overdueInstallments: 3,
        lastPurchase: '2024-06-05',
    },
    {
        id: '3',
        client: 'Marcelo Souza',
        email: 'marcelo.souza@email.com',
        totalDebt: 799.99,
        overdueInstallments: 1,
        lastPurchase: '2024-06-10',
    },
    {
        id: '4',
        client: 'Roberto Almeida',
        email: 'roberto.almeida@email.com',
        totalDebt: 3299.99,
        overdueInstallments: 4,
        lastPurchase: '2024-06-08',
    },
    {
        id: '5',
        client: 'Lucia Mendes',
        email: 'lucia.mendes@email.com',
        totalDebt: 899.99,
        overdueInstallments: 2,
        lastPurchase: '2024-06-07',
    },
];

export const mockPaymentMethodReport: PaymentMethodReport[] = [
    {
        id: '1',
        paymentMethod: 'Crédito',
        transactions: 156,
        totalAmount: 234567.89,
    },
    {
        id: '2',
        paymentMethod: 'Débito',
        transactions: 89,
        totalAmount: 89234.56,
    },
    {
        id: '3',
        paymentMethod: 'PIX',
        transactions: 234,
        totalAmount: 156789.12,
    },
    {
        id: '4',
        paymentMethod: 'Dinheiro',
        transactions: 45,
        totalAmount: 34567.89,
    },
    {
        id: '5',
        paymentMethod: 'Parcelado',
        transactions: 78,
        totalAmount: 123456.78,
    },
];

export const mockTopClientsReport: TopClientsReport[] = [
    {
        id: '1',
        client: 'João Silva',
        email: 'joao.silva@email.com',
        totalPurchases: 15,
        totalSpent: 4599.98,
    },
    {
        id: '2',
        client: 'Fernanda Lima',
        email: 'fernanda.lima@email.com',
        totalPurchases: 12,
        totalSpent: 3399.98,
    },
    {
        id: '3',
        client: 'Maria Santos',
        email: 'maria.santos@email.com',
        totalPurchases: 8,
        totalSpent: 4599.99,
    },
    {
        id: '4',
        client: 'Carlos Oliveira',
        email: 'carlos.oliveira@email.com',
        totalPurchases: 6,
        totalSpent: 659.97,
    },
    {
        id: '5',
        client: 'Lucia Mendes',
        email: 'lucia.mendes@email.com',
        totalPurchases: 5,
        totalSpent: 899.99,
    },
    {
        id: '6',
        client: 'Ana Ferreira',
        email: 'ana.ferreira@email.com',
        totalPurchases: 4,
        totalSpent: 1999.97,
    },
    {
        id: '7',
        client: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        totalPurchases: 3,
        totalSpent: 599.99,
    },
    {
        id: '8',
        client: 'Roberto Almeida',
        email: 'roberto.almeida@email.com',
        totalPurchases: 3,
        totalSpent: 3299.99,
    },
    {
        id: '9',
        client: 'Marcelo Souza',
        email: 'marcelo.souza@email.com',
        totalPurchases: 2,
        totalSpent: 799.99,
    },
    {
        id: '10',
        client: 'Patricia Rocha',
        email: 'patricia.rocha@email.com',
        totalPurchases: 2,
        totalSpent: 599.98,
    },
];

export const mockClientsByCityReport: ClientsByCityReport[] = [
    {
        id: '1',
        city: 'São Paulo',
        state: 'SP',
        clientCount: 2,
        totalSpent: 5199.97,
    },
    {
        id: '2',
        city: 'Rio de Janeiro',
        state: 'RJ',
        clientCount: 2,
        totalSpent: 5199.98,
    },
    {
        id: '3',
        city: 'Belo Horizonte',
        state: 'MG',
        clientCount: 1,
        totalSpent: 659.97,
    },
    {
        id: '4',
        city: 'Curitiba',
        state: 'PR',
        clientCount: 1,
        totalSpent: 1999.97,
    },
    {
        id: '5',
        city: 'Porto Alegre',
        state: 'RS',
        clientCount: 1,
        totalSpent: 599.99,
    },
    {
        id: '6',
        city: 'Brasília',
        state: 'DF',
        clientCount: 1,
        totalSpent: 899.99,
    },
    {
        id: '7',
        city: 'Salvador',
        state: 'BA',
        clientCount: 1,
        totalSpent: 3299.99,
    },
    {
        id: '8',
        city: 'Recife',
        state: 'PE',
        clientCount: 1,
        totalSpent: 3399.98,
    },
    {
        id: '9',
        city: 'Niterói',
        state: 'RJ',
        clientCount: 1,
        totalSpent: 599.98,
    },
];

export type ReportType =
    | 'vendas'
    | 'produtos-mais-vendidos'
    | 'vendas-categoria'
    | 'vendas-marca'
    | 'estoque-atual'
    | 'estoque-marca'
    | 'proximos-vencer'
    | 'perdas'
    | 'inadimplencia'
    | 'pagamentos-metodo'
    | 'maiores-compradores'
    | 'clientes-cidade';

export const getMockReportData = (type: ReportType) => {
    switch (type) {
        case 'vendas':
            return mockSalesReport;
        case 'produtos-mais-vendidos':
            return mockTopProductsReport;
        case 'vendas-categoria':
            return mockSalesByCategoryReport;
        case 'vendas-marca':
            return mockSalesByBrandReport;
        case 'estoque-atual':
            return mockStockReport;
        case 'estoque-marca':
            return mockStockByBrandReport;
        case 'proximos-vencer':
            return mockExpiringReport;
        case 'perdas':
            return mockLossesReport;
        case 'inadimplencia':
            return mockClientDebtReport;
        case 'pagamentos-metodo':
            return mockPaymentMethodReport;
        case 'maiores-compradores':
            return mockTopClientsReport;
        case 'clientes-cidade':
            return mockClientsByCityReport;
        default:
            return [];
    }
};

export const reportTitles: Record<ReportType, string> = {
    vendas: 'Vendas',
    'produtos-mais-vendidos': 'Produtos Mais Vendidos',
    'vendas-categoria': 'Vendas por Categoria',
    'vendas-marca': 'Vendas por Marca',
    'estoque-atual': 'Estoque Atual',
    'estoque-marca': 'Estoque por Marca',
    'proximos-vencer': 'Próximos de Vencer',
    perdas: 'Perdas',
    inadimplencia: 'Inadimplência por Cliente',
    'pagamentos-metodo': 'Pagamentos por Método',
    'maiores-compradores': 'Maiores Compradores',
    'clientes-cidade': 'Clientes por Cidade',
};
