import { Form } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPasswordPageContent({
    status,
}: {
    status?: string;
}) {
    return (
        <>
            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-white"
                                >
                                    E-mail
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="voce@empresa.com"
                                    className="h-11 border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus-visible:border-accent focus-visible:ring-accent/30"
                                />

                                <InputError message={errors.email} />
                            </div>
                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="h-11 w-full rounded-lg bg-accent font-semibold text-black hover:bg-accent/90 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-70"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    Enviar link de redefinição
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Ou, voltar para</span>
                    <TextLink href={login()}>Entrar</TextLink>
                </div>
            </div>
        </>
    );
}
