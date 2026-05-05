import { Form } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmailPageContent({
    status,
}: {
    status?: string;
}) {
    return (
        <>
            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Um novo link de verificação foi enviado para o e-mail que
                    você forneceu no cadastro.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            className="h-11 w-full rounded-lg bg-accent font-semibold text-black hover:bg-accent/90 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {processing && <Spinner />}
                            Reenviar e-mail de verificação
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            Sair
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}
