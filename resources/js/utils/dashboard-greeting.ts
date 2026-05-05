export const DASHBOARD_GREETINGS = [
    'Cada dia é uma nova oportunidade para avançar.',
    'Pequenos passos somam grandes resultados; continue.',
    'Planeje menos, execute mais e siga no caminho certo.',
    'Foque no progresso, não na perfeição.',
    'Aprenda rápido, adapte-se e vença o dia.',
] as const;

export function getDashboardGreetingForDate(date = new Date()): string {
    const days = Math.floor(date.getTime() / 86400000);

    return DASHBOARD_GREETINGS[days % DASHBOARD_GREETINGS.length];
}

export function getDashboardGreetingForToday(): string {
    return getDashboardGreetingForDate(new Date());
}
