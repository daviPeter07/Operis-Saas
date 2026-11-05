import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type ScaledScreenProps = {
    width: number;
    height: number;
    children: ReactNode;
};

/**
 * Renders a screen at the real app size (e.g. 1280px wide) and scales it down
 * to fit the device frame, so the mock looks like the actual interface.
 */
export function ScaledScreen({ width, height, children }: ScaledScreenProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState<number | null>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const observer = new ResizeObserver(([entry]) =>
            setScale(entry.contentRect.width / width),
        );
        observer.observe(container);

        return () => observer.disconnect();
    }, [width]);

    return (
        <div ref={containerRef} className="size-full overflow-hidden">
            <div
                className={scale === null ? 'invisible' : undefined}
                style={{
                    width,
                    height,
                    transform: `scale(${scale ?? 1})`,
                    transformOrigin: 'top left',
                }}
            >
                {children}
            </div>
        </div>
    );
}
