import { LandingNavbar } from '@/features/home/landing-navbar';

export default function HomePageContent() {
    return (
        <div className="min-h-svh bg-background text-foreground">
            <LandingNavbar />

            <main id="inicio" className="p-6">
                <h1>Essa é a landing page no operis</h1>
            </main>
        </div>
    );
}
