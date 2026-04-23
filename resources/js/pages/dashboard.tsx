import { Head } from '@inertiajs/react';
import DashboardPageContent from '@/components/features/dashboard/dashboard-page-content';

type Props = {
    message: string;
};

export default function Dashboard({ message }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <DashboardPageContent message={message} />
        </>
    );
}
