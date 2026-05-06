import { buildThermalEscPosBytes } from '@/lib/thermal-escpos';
import type { Sale } from '@/schemas/sale';
import type { ThermalPaperWidth } from '@/utils/sale-documents';

type BrowserSerial = {
    getPorts: () => Promise<SerialPort[]>;
    requestPort: () => Promise<SerialPort>;
};

declare global {
    interface Navigator {
        serial?: BrowserSerial;
    }
    interface SerialPort {
        open: (options: {
            baudRate: number;
            dataBits?: 7 | 8;
            stopBits?: 1 | 2;
            parity?: 'none' | 'even' | 'odd';
            bufferSize?: number;
            flowControl?: 'none' | 'hardware';
        }) => Promise<void>;
        close: () => Promise<void>;
        writable: WritableStream<Uint8Array> | null;
        forget?: () => Promise<void>;
    }
}

const SERIAL_OPEN_OPTIONS = {
    baudRate: 9600,
    dataBits: 8 as const,
    stopBits: 1 as const,
    parity: 'none' as const,
    bufferSize: 255,
    flowControl: 'none' as const,
};

export function isWebSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && Boolean(navigator.serial);
}

async function resolveSerialPort(): Promise<SerialPort> {
    if (!navigator.serial) {
        throw new Error(
            'Seu navegador nao suporta Web Serial. Use Chrome ou Edge atualizados.',
        );
    }

    const existingPorts = await navigator.serial.getPorts();

    if (existingPorts.length > 0) {
        return existingPorts[0];
    }

    return navigator.serial.requestPort();
}

export async function printSaleThermalReceiptWithWebSerial(
    sale: Sale,
    paperWidth: ThermalPaperWidth,
): Promise<void> {
    const port = await resolveSerialPort();
    const payload = buildThermalEscPosBytes(sale, paperWidth);

    await port.open(SERIAL_OPEN_OPTIONS);

    try {
        const writer = port.writable?.getWriter();

        if (!writer) {
            throw new Error(
                'A porta serial foi aberta, mas nao ficou gravavel.',
            );
        }

        try {
            await writer.write(payload);
        } finally {
            writer.releaseLock();
        }
    } finally {
        await port.close();
    }
}
