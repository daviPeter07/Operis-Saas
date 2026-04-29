import { Head } from '@inertiajs/react';
import HomePageContent from '@/features/home/home-page-content';

type Props = {
    message: string;
};

export default function Home({ message }: Props) {
    return (
        <>
            <Head title="Home" />
            <HomePageContent message={message} />
        </>
    );
}
