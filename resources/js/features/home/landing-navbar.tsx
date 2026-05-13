import { Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { landingNavigationItems } from '@/constants/navigation';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const navLinkClassName =
    'group relative rounded-md px-3 py-2 text-[11px] font-medium tracking-[0.16em] transition-colors';

const mobileLinkClassName =
    'block w-full rounded-md px-3 py-2 text-left text-sm font-medium tracking-[0.12em] transition-colors';

function ThemeToggleButton({ className }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        const newAppearance = appearance === 'dark' ? 'light' : 'dark';
        updateAppearance(newAppearance);
    };

    return (
        <Button
            onClick={toggleTheme}
            className={cn(
                'relative grid h-9 w-9 place-items-center rounded-full border backdrop-blur-sm transition-colors',
                appearance === 'light'
                    ? 'border-black/30 bg-white text-black hover:border-black/50 hover:bg-black/5 hover:text-black'
                    : 'border-white/60 bg-black/70 text-white hover:border-white hover:bg-white/10 hover:text-white',
                className,
            )}
            aria-label={
                appearance === 'dark'
                    ? 'Ativar tema claro'
                    : 'Ativar tema escuro'
            }
        >
            <Sun
                className={cn(
                    'absolute size-4 transition-all duration-300',
                    appearance === 'dark'
                        ? 'scale-100 rotate-0 opacity-100'
                        : 'scale-0 rotate-90 opacity-0',
                )}
            />
            <Moon
                className={cn(
                    'absolute size-4 transition-all duration-300',
                    appearance === 'dark'
                        ? 'scale-0 rotate-90 opacity-0'
                        : 'scale-100 rotate-0 opacity-100',
                )}
            />
        </Button>
    );
}

export function LandingNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { appearance } = useAppearance();
    const isLightTheme = appearance === 'light';

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="h-20" id="inicio">
            <nav
                className={cn(
                    'fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-xl',
                    isLightTheme
                        ? 'border-orange-500/20 bg-white/95'
                        : 'border-orange-500/20 bg-black/80',
                )}
            >
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <a
                        href="#inicio"
                        className="flex items-center gap-2"
                        onClick={closeMobileMenu}
                        aria-label="Ir para o início"
                    >
                        <span className="text-base font-semibold tracking-[-0.02em] text-orange-500">
                            OPERIS
                        </span>
                    </a>

                    <div className="hidden flex-1 items-center justify-center gap-1 px-10 lg:flex">
                        {landingNavigationItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    navLinkClassName,
                                    isLightTheme
                                        ? 'text-black/85 hover:text-black'
                                        : 'text-white/85 hover:text-white',
                                )}
                            >
                                {item.label.toUpperCase()}
                                <span className="absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-orange-500 transition-all duration-300 group-hover:w-6" />
                            </a>
                        ))}
                    </div>

                    <div className="hidden items-center gap-2 lg:flex">
                        <ThemeToggleButton />
                    </div>

                    <div className="flex items-center gap-2 lg:hidden">
                        <ThemeToggleButton />

                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'p-2',
                                isLightTheme
                                    ? 'text-black hover:bg-black/10 hover:text-black'
                                    : 'text-white hover:bg-white/10 hover:text-white',
                            )}
                            aria-controls="navbar-menu"
                            aria-expanded={isMobileMenuOpen}
                            aria-label={
                                isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'
                            }
                            onClick={() =>
                                setIsMobileMenuOpen((value) => !value)
                            }
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>

                <div
                    id="navbar-menu"
                    className={cn(
                        'overflow-hidden transition-all duration-300 ease-in-out lg:hidden',
                        isMobileMenuOpen
                            ? 'max-h-[36rem] opacity-100'
                            : 'max-h-0 opacity-0',
                    )}
                >
                    <div className="space-y-1 border-t border-orange-500/20 px-4 py-4">
                        {landingNavigationItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    mobileLinkClassName,
                                    isLightTheme
                                        ? 'text-black/85 hover:bg-black/10 hover:text-black'
                                        : 'text-white/85 hover:bg-white/10 hover:text-white',
                                )}
                                onClick={closeMobileMenu}
                            >
                                {item.label.toUpperCase()}
                            </a>
                        ))}
                    </div>
                </div>
            </nav>
        </header>
    );
}
