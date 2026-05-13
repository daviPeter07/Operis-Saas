export type LandingNavigationItem = {
    label: string;
    href: `#${string}`;
};

export const landingNavigationItems: LandingNavigationItem[] = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Solução', href: '#solucao' },
    { label: 'Ajuda', href: '#ajuda' },
    { label: 'Preço', href: '#preco' },
];
