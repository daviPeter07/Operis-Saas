import { Head } from '@inertiajs/react';
import RegisterPageContent from '@/features/auth/register-page-content';

export default function Register() {
    return (
        <>
            <Head title="Register" />
            <RegisterPageContent />
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};
