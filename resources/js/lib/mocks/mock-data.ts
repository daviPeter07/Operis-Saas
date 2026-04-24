export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    cost: number;
    stock: number;
    category: string;
    brand: string;
    minStock: number;
    createdAt: string;
}

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    city: string;
    state: string;
    address: string;
    createdAt: string;
}

export interface Supplier {
    id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    city: string;
    state: string;
    address: string;
    createdAt: string;
}

export interface Brand {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    description: string;
    parentId: string | null;
    createdAt: string;
}

export interface Sale {
    id: string;
    clientId: string;
    clientName: string;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    paymentMethod: 'money' | 'credit' | 'debit' | 'pix' | 'installment';
    items: number;
    createdAt: string;
}

export interface Purchase {
    id: string;
    supplierId: string;
    supplierName: string;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    paymentMethod: 'money' | 'credit' | 'debit' | 'pix';
    items: number;
    dueDate: string;
    createdAt: string;
}

export const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Smartphone Samsung Galaxy',
        sku: 'SMG-S24',
        price: 2999.99,
        cost: 1800,
        stock: 45,
        category: 'Eletrônicos',
        brand: 'Samsung',
        minStock: 10,
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        name: 'Notebook Dell Inspiron',
        sku: 'DELL-INS-15',
        price: 4599.99,
        cost: 3200,
        stock: 12,
        category: 'Eletrônicos',
        brand: 'Dell',
        minStock: 5,
        createdAt: '2024-01-20',
    },
    {
        id: '3',
        name: 'Fone Bluetooth JBL',
        sku: 'JBL-TUNE-500',
        price: 299.99,
        cost: 150,
        stock: 78,
        category: 'Áudio',
        brand: 'JBL',
        minStock: 20,
        createdAt: '2024-02-01',
    },
    {
        id: '4',
        name: 'Mouse Sem Fio Logitech',
        sku: 'LOG-M220',
        price: 89.99,
        cost: 45,
        stock: 156,
        category: 'Periféricos',
        brand: 'Logitech',
        minStock: 30,
        createdAt: '2024-02-10',
    },
    {
        id: '5',
        name: 'Teclado Mecânico RGB',
        sku: 'RGB-TKL-001',
        price: 459.99,
        cost: 250,
        stock: 34,
        category: 'Periféricos',
        brand: 'Redragon',
        minStock: 15,
        createdAt: '2024-02-15',
    },
    {
        id: '6',
        name: 'Monitor 24" Full HD',
        sku: 'MON-24-FHD',
        price: 999.99,
        cost: 650,
        stock: 8,
        category: 'Eletrônicos',
        brand: 'LG',
        minStock: 5,
        createdAt: '2024-02-20',
    },
    {
        id: '7',
        name: 'Webcam HD 1080p',
        sku: 'WC-HD-1080',
        price: 299.99,
        cost: 180,
        stock: 23,
        category: 'Eletrônicos',
        brand: 'Logitech',
        minStock: 10,
        createdAt: '2024-03-01',
    },
    {
        id: '8',
        name: 'Carregador Turbo USB-C',
        sku: 'CHG-TB-65W',
        price: 149.99,
        cost: 75,
        stock: 89,
        category: 'Acessórios',
        brand: 'Samsung',
        minStock: 25,
        createdAt: '2024-03-05',
    },
    {
        id: '9',
        name: ' Cabo HDMI 2.1',
        sku: 'HDMI-2.1-2M',
        price: 79.99,
        cost: 35,
        stock: 134,
        category: 'Acessórios',
        brand: 'Kabex',
        minStock: 30,
        createdAt: '2024-03-10',
    },
    {
        id: '10',
        name: 'Pen Drive 128GB',
        sku: 'PFD-128-USB3',
        price: 59.99,
        cost: 25,
        stock: 201,
        category: 'Armazenamento',
        brand: 'Sandisk',
        minStock: 50,
        createdAt: '2024-03-15',
    },
    {
        id: '11',
        name: 'SSD 512GB NVMe',
        sku: 'SSD-512-NVM',
        price: 399.99,
        cost: 280,
        stock: 42,
        category: 'Armazenamento',
        brand: 'Kingston',
        minStock: 15,
        createdAt: '2024-03-20',
    },
    {
        id: '12',
        name: 'HD Externo 1TB',
        sku: 'HDE-1TB-USB3',
        price: 299.99,
        cost: 180,
        stock: 28,
        category: 'Armazenamento',
        brand: 'Seagate',
        minStock: 10,
        createdAt: '2024-03-25',
    },
    {
        id: '13',
        name: 'Mouse Pad Gamer XL',
        sku: 'MP-GAM-XL',
        price: 129.99,
        cost: 55,
        stock: 67,
        category: 'Periféricos',
        brand: 'Razer',
        minStock: 20,
        createdAt: '2024-04-01',
    },
    {
        id: '14',
        name: 'Webcam 4K Pro',
        sku: 'WC-4K-PRO',
        price: 899.99,
        cost: 550,
        stock: 5,
        category: 'Eletrônicos',
        brand: 'Logitech',
        minStock: 3,
        createdAt: '2024-04-05',
    },
    {
        id: '15',
        name: 'Caixa de Som Portátil',
        sku: 'CSP-BT-360',
        price: 699.99,
        cost: 420,
        stock: 19,
        category: 'Áudio',
        brand: 'JBL',
        minStock: 8,
        createdAt: '2024-04-10',
    },
    {
        id: '16',
        name: 'Smartwatch Galaxy Watch',
        sku: 'SMW-GW-6',
        price: 1599.99,
        cost: 950,
        stock: 15,
        category: 'Wearables',
        brand: 'Samsung',
        minStock: 5,
        createdAt: '2024-04-15',
    },
    {
        id: '17',
        name: 'Tablet Samsung Tab S9',
        sku: 'TAB-S9-FE',
        price: 3299.99,
        cost: 2100,
        stock: 7,
        category: 'Eletrônicos',
        brand: 'Samsung',
        minStock: 3,
        createdAt: '2024-04-20',
    },
    {
        id: '18',
        name: 'Pen drive 64GB',
        sku: 'PFD-64-USB3',
        price: 39.99,
        cost: 18,
        stock: 245,
        category: 'Armazenamento',
        brand: 'Sandisk',
        minStock: 50,
        createdAt: '2024-04-25',
    },
    {
        id: '19',
        name: 'Fone Ouvido Premium',
        sku: 'HO-PREM-001',
        price: 899.99,
        cost: 520,
        stock: 11,
        category: 'Áudio',
        brand: 'Sony',
        minStock: 5,
        createdAt: '2024-05-01',
    },
    {
        id: '20',
        name: 'Roteador WiFi 6',
        sku: 'ROT-W6-3000',
        price: 599.99,
        cost: 350,
        stock: 22,
        category: 'Redes',
        brand: 'TP-Link',
        minStock: 10,
        createdAt: '2024-05-05',
    },
    {
        id: '21',
        name: 'Hub USB-C 7 Portas',
        sku: 'HUB-USBC-7',
        price: 199.99,
        cost: 95,
        stock: 56,
        category: 'Acessórios',
        brand: 'Ugreen',
        minStock: 15,
        createdAt: '2024-05-10',
    },
    {
        id: '22',
        name: 'Cabo Lightning Apple',
        sku: 'LGT-1M-MFI',
        price: 149.99,
        cost: 65,
        stock: 89,
        category: 'Acessórios',
        brand: 'Apple',
        minStock: 25,
        createdAt: '2024-05-15',
    },
    {
        id: '23',
        name: 'Power Bank 20000mAh',
        sku: 'PB-20K-2USB',
        price: 249.99,
        cost: 130,
        stock: 43,
        category: 'Acessórios',
        brand: 'Samsung',
        minStock: 15,
        createdAt: '2024-05-20',
    },
    {
        id: '24',
        name: 'Monitor 27" 4K',
        sku: 'MON-27-4K',
        price: 2499.99,
        cost: 1600,
        stock: 6,
        category: 'Eletrônicos',
        brand: 'Samsung',
        minStock: 3,
        createdAt: '2024-05-25',
    },
    {
        id: '25',
        name: 'Notebook Lenovo ThinkPad',
        sku: 'LEN-TP-E15',
        price: 5299.99,
        cost: 3600,
        stock: 9,
        category: 'Eletrônicos',
        brand: 'Lenovo',
        minStock: 5,
        createdAt: '2024-06-01',
    },
    {
        id: '26',
        name: 'Impressora Térmica',
        sku: 'IMP-TERM-80',
        price: 799.99,
        cost: 480,
        stock: 14,
        category: 'Escritório',
        brand: 'Epson',
        minStock: 5,
        createdAt: '2024-06-05',
    },
    {
        id: '27',
        name: 'Scanner Portátil',
        sku: 'SCN-PORT-001',
        price: 599.99,
        cost: 350,
        stock: 11,
        category: 'Escritório',
        brand: 'Brother',
        minStock: 5,
        createdAt: '2024-06-10',
    },
    {
        id: '28',
        name: 'Mouse Sem Fio Vertical',
        sku: 'MS-VRT-001',
        price: 179.99,
        cost: 85,
        stock: 34,
        category: 'Periféricos',
        brand: 'Logitech',
        minStock: 10,
        createdAt: '2024-06-15',
    },
    {
        id: '29',
        name: 'Teclado Slim Wireless',
        sku: 'TCL-SLIM-W',
        price: 199.99,
        cost: 95,
        stock: 52,
        category: 'Periféricos',
        brand: 'Microsoft',
        minStock: 15,
        createdAt: '2024-06-20',
    },
    {
        id: '30',
        name: 'Caixa de Som 2.1',
        sku: 'CSP-2.1-100W',
        price: 399.99,
        cost: 220,
        stock: 18,
        category: 'Áudio',
        brand: 'Logitech',
        minStock: 8,
        createdAt: '2024-06-25',
    },
];

export const mockClients: Client[] = [
    {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-1111',
        document: '123.456.789-00',
        city: 'São Paulo',
        state: 'SP',
        address: 'Rua das Flores, 100',
        createdAt: '2024-01-10',
    },
    {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(21) 99999-2222',
        document: '234.567.890-11',
        city: 'Rio de Janeiro',
        state: 'RJ',
        address: 'Av. Brasil, 500',
        createdAt: '2024-01-15',
    },
    {
        id: '3',
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira@email.com',
        phone: '(31) 99999-3333',
        document: '345.678.901-22',
        city: 'Belo Horizonte',
        state: 'MG',
        address: 'Rua do Sol, 200',
        createdAt: '2024-02-01',
    },
    {
        id: '4',
        name: 'Ana Ferreira',
        email: 'ana.ferreira@email.com',
        phone: '(41) 99999-4444',
        document: '456.789.012-33',
        city: 'Curitiba',
        state: 'PR',
        address: 'Av. Paraná, 300',
        createdAt: '2024-02-10',
    },
    {
        id: '5',
        name: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        phone: '(51) 99999-5555',
        document: '567.890.123-44',
        city: 'Porto Alegre',
        state: 'RS',
        address: 'Rua da Praia, 400',
        createdAt: '2024-02-20',
    },
    {
        id: '6',
        name: 'Lucia Mendes',
        email: 'lucia.mendes@email.com',
        phone: '(61) 99999-6666',
        document: '678.901.234-55',
        city: 'Brasília',
        state: 'DF',
        address: 'SQN 102/104',
        createdAt: '2024-03-01',
    },
    {
        id: '7',
        name: 'Roberto Almeida',
        email: 'roberto.almeida@email.com',
        phone: '(71) 99999-7777',
        document: '789.012.345-66',
        city: 'Salvador',
        state: 'BA',
        address: 'Av. ACM, 1000',
        createdAt: '2024-03-10',
    },
    {
        id: '8',
        name: 'Fernanda Lima',
        email: 'fernanda.lima@email.com',
        phone: '(81) 99999-8888',
        document: '890.123.456-77',
        city: 'Recife',
        state: 'PE',
        address: 'Rua das Varas, 50',
        createdAt: '2024-03-20',
    },
    {
        id: '9',
        name: 'Marcelo Souza',
        email: 'marcelo.souza@email.com',
        phone: '(11) 99999-9999',
        document: '901.234.567-88',
        city: 'São Paulo',
        state: 'SP',
        address: 'Rua Augusta, 200',
        createdAt: '2024-04-01',
    },
    {
        id: '10',
        name: 'Patricia Rocha',
        email: 'patricia.rocha@email.com',
        phone: '(21) 88888-1111',
        document: '012.345.678-99',
        city: 'Niterói',
        state: 'RJ',
        address: 'Av. 13 de Maio, 100',
        createdAt: '2024-04-10',
    },
];

export const mockSuppliers: Supplier[] = [
    {
        id: '1',
        name: 'Tech Distribuidora',
        email: 'contato@techdistrib.com.br',
        phone: '(11) 3333-4444',
        document: '12.345.678/0001-99',
        city: 'São Paulo',
        state: 'SP',
        address: 'Av. Paulista, 1000',
        createdAt: '2024-01-05',
    },
    {
        id: '2',
        name: 'Global Parts',
        email: 'vendas@globalparts.com.br',
        phone: '(21) 2222-3333',
        document: '23.456.789/0001-11',
        city: 'Rio de Janeiro',
        state: 'RJ',
        address: 'Av. Atlântica, 500',
        createdAt: '2024-01-10',
    },
    {
        id: '3',
        name: 'Info Tech Ltda',
        email: 'contato@infotech.com.br',
        phone: '(31) 4444-5555',
        document: '34.567.890/0001-22',
        city: 'Belo Horizonte',
        state: 'MG',
        address: 'Rua da Alegria, 150',
        createdAt: '2024-01-20',
    },
    {
        id: '4',
        name: 'Mega Electronics',
        email: 'vendas@megaelectronics.com.br',
        phone: '(41) 5555-6666',
        document: '45.678.901/0001-33',
        city: 'Curitiba',
        state: 'PR',
        address: 'Av. Sete de Setembro, 2000',
        createdAt: '2024-02-01',
    },
    {
        id: '5',
        name: 'Distribuidora Nacional',
        email: 'contato@distribuidoranacional.com.br',
        phone: '(51) 6666-7777',
        document: '56.789.012/0001-44',
        city: 'Porto Alegre',
        state: 'RS',
        address: 'Av. Ipiranga, 3000',
        createdAt: '2024-02-15',
    },
];

export const mockBrands: Brand[] = [
    {
        id: '1',
        name: 'Samsung',
        description: 'Eletrônicos e tecnologia',
        createdAt: '2024-01-01',
    },
    {
        id: '2',
        name: 'Apple',
        description: 'Produtos Apple',
        createdAt: '2024-01-01',
    },
    {
        id: '3',
        name: 'Logitech',
        description: 'Periféricos de computador',
        createdAt: '2024-01-01',
    },
    {
        id: '4',
        name: 'JBL',
        description: 'Áudio e caixas de som',
        createdAt: '2024-01-01',
    },
    {
        id: '5',
        name: 'Dell',
        description: 'Computadores e notebooks',
        createdAt: '2024-01-01',
    },
    {
        id: '6',
        name: 'Lenovo',
        description: 'Notebooks e desktops',
        createdAt: '2024-01-01',
    },
    {
        id: '7',
        name: 'Sony',
        description: 'Eletrônicos e áudio',
        createdAt: '2024-01-01',
    },
    {
        id: '8',
        name: 'LG',
        description: 'Eletrônicos e eletrodomésticos',
        createdAt: '2024-01-01',
    },
    {
        id: '9',
        name: 'Redragon',
        description: 'Periféricos gamers',
        createdAt: '2024-01-01',
    },
    {
        id: '10',
        name: 'Razer',
        description: 'Equipamentos para gamers',
        createdAt: '2024-01-01',
    },
];

export const mockCategories: Category[] = [
    {
        id: '1',
        name: 'Eletrônicos',
        description: 'Aparelhos eletrônicos em geral',
        parentId: null,
        createdAt: '2024-01-01',
    },
    {
        id: '2',
        name: 'Áudio',
        description: 'Caixas de som e fones',
        parentId: null,
        createdAt: '2024-01-01',
    },
    {
        id: '3',
        name: 'Periféricos',
        description: 'Mouse, teclado e outros',
        parentId: null,
        createdAt: '2024-01-01',
    },
    {
        id: '4',
        name: 'Acessórios',
        description: 'Cabos, carregadores e outros',
        parentId: null,
        createdAt: '2024-01-01',
    },
    {
        id: '5',
        name: 'Armazenamento',
        description: 'Pen drives, SSDs e HDs',
        parentId: null,
        createdAt: '2024-01-01',
    },
    {
        id: '6',
        name: 'Wearables',
        description: 'Smartwatches e pulseiras',
        parentId: null,
        createdAt: '2024-01-01',
    },
    {
        id: '7',
        name: 'Redes',
        description: 'Roteadores e switches',
        parentId: null,
        createdAt: '2024-01-01',
    },
    {
        id: '8',
        name: 'Escritório',
        description: 'Impressoras e scanners',
        parentId: null,
        createdAt: '2024-01-01',
    },
];

export const mockSales: Sale[] = [
    {
        id: '1',
        clientId: '1',
        clientName: 'João Silva',
        total: 2999.99,
        status: 'completed',
        paymentMethod: 'credit',
        items: 1,
        createdAt: '2024-06-01',
    },
    {
        id: '2',
        clientId: '2',
        clientName: 'Maria Santos',
        total: 4599.99,
        status: 'completed',
        paymentMethod: 'pix',
        items: 1,
        createdAt: '2024-06-02',
    },
    {
        id: '3',
        clientId: '3',
        clientName: 'Carlos Oliveira',
        total: 899.98,
        status: 'completed',
        paymentMethod: 'debit',
        items: 3,
        createdAt: '2024-06-03',
    },
    {
        id: '4',
        clientId: '4',
        clientName: 'Ana Ferreira',
        total: 2399.97,
        status: 'pending',
        paymentMethod: 'installment',
        items: 2,
        createdAt: '2024-06-04',
    },
    {
        id: '5',
        clientId: '5',
        clientName: 'Pedro Costa',
        total: 599.99,
        status: 'completed',
        paymentMethod: 'money',
        items: 1,
        createdAt: '2024-06-05',
    },
    {
        id: '6',
        clientId: '1',
        clientName: 'João Silva',
        total: 1599.99,
        status: 'completed',
        paymentMethod: 'credit',
        items: 1,
        createdAt: '2024-06-06',
    },
    {
        id: '7',
        clientId: '6',
        clientName: 'Lucia Mendes',
        total: 899.99,
        status: 'completed',
        paymentMethod: 'pix',
        items: 1,
        createdAt: '2024-06-07',
    },
    {
        id: '8',
        clientId: '7',
        clientName: 'Roberto Almeida',
        total: 3299.99,
        status: 'cancelled',
        paymentMethod: 'credit',
        items: 1,
        createdAt: '2024-06-08',
    },
    {
        id: '9',
        clientId: '8',
        clientName: 'Fernanda Lima',
        total: 2499.98,
        status: 'completed',
        paymentMethod: 'debit',
        items: 2,
        createdAt: '2024-06-09',
    },
    {
        id: '10',
        clientId: '9',
        clientName: 'Marcelo Souza',
        total: 799.99,
        status: 'pending',
        paymentMethod: 'installment',
        items: 1,
        createdAt: '2024-06-10',
    },
];

export const mockPurchases: Purchase[] = [
    {
        id: '1',
        supplierId: '1',
        supplierName: 'Tech Distribuidora',
        total: 50000,
        status: 'completed',
        paymentMethod: 'credit',
        items: 100,
        dueDate: '2024-07-01',
        createdAt: '2024-06-01',
    },
    {
        id: '2',
        supplierId: '2',
        supplierName: 'Global Parts',
        total: 35000,
        status: 'completed',
        paymentMethod: 'pix',
        items: 75,
        dueDate: '2024-07-15',
        createdAt: '2024-06-05',
    },
    {
        id: '3',
        supplierId: '3',
        supplierName: 'Info Tech Ltda',
        total: 42000,
        status: 'pending',
        paymentMethod: 'credit',
        items: 90,
        dueDate: '2024-08-01',
        createdAt: '2024-06-10',
    },
    {
        id: '4',
        supplierId: '4',
        supplierName: 'Mega Electronics',
        total: 28000,
        status: 'completed',
        paymentMethod: 'debit',
        items: 60,
        dueDate: '2024-07-20',
        createdAt: '2024-06-15',
    },
    {
        id: '5',
        supplierId: '5',
        supplierName: 'Distribuidora Nacional',
        total: 55000,
        status: 'pending',
        paymentMethod: 'credit',
        items: 110,
        dueDate: '2024-08-15',
        createdAt: '2024-06-20',
    },
];

export type TableType =
    | 'products'
    | 'clients'
    | 'suppliers'
    | 'brands'
    | 'categories'
    | 'sales'
    | 'purchases';

export const getMockData = (type: TableType) => {
    switch (type) {
        case 'products':
            return mockProducts;
        case 'clients':
            return mockClients;
        case 'suppliers':
            return mockSuppliers;
        case 'brands':
            return mockBrands;
        case 'categories':
            return mockCategories;
        case 'sales':
            return mockSales;
        case 'purchases':
            return mockPurchases;
        default:
            return [];
    }
};
