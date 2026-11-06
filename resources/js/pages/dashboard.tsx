import { Head } from '@inertiajs/react';
import { PageContent } from '@/components/page-content';

type Props = {
    message: string;
};

export default function Dashboard({ message }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <PageContent>{message}</PageContent>
        </>
    );
}
