import { Form } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function RegisterPageContent() {
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    return (
        <Form
            {...store.form()}
            resetOnSuccess={['password', 'password_confirmation', 'terms']}
            disableWhileProcessing
            className="flex flex-col gap-6"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="name"
                                className="text-sm font-medium text-white"
                            >
                                Nome
                            </Label>

                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                name="name"
                                placeholder="Seu nome completo"
                                className="h-11 border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus-visible:border-accent focus-visible:ring-accent/30"
                            />

                            <InputError message={errors.name} />
                        </div>

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
                                required
                                tabIndex={2}
                                autoComplete="email"
                                name="email"
                                placeholder="voce@empresa.com"
                                className="h-11 border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus-visible:border-accent focus-visible:ring-accent/30"
                            />

                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password"
                                className="text-sm font-medium text-white"
                            >
                                Senha
                            </Label>

                            <PasswordInput
                                id="password"
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                name="password"
                                placeholder="Crie uma senha"
                                className="h-11 border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus-visible:border-accent focus-visible:ring-accent/30"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password_confirmation"
                                className="text-sm font-medium text-white"
                            >
                                Confirmar senha
                            </Label>

                            <PasswordInput
                                id="password_confirmation"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                name="password_confirmation"
                                placeholder="Repita sua senha"
                                className="h-11 border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus-visible:border-accent focus-visible:ring-accent/30"
                            />

                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="terms"
                                    checked={acceptedTerms}
                                    onCheckedChange={(checked) =>
                                        setAcceptedTerms(Boolean(checked))
                                    }
                                    tabIndex={5}
                                    className="mt-1 border-zinc-700 bg-black data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-black"
                                />

                                <Label
                                    htmlFor="terms"
                                    className="cursor-pointer text-sm leading-6 text-zinc-400"
                                >
                                    Eu li e aceito os termos de uso e a política
                                    de privacidade.
                                </Label>
                            </div>

                            <input
                                type="hidden"
                                name="terms"
                                value={acceptedTerms ? '1' : '0'}
                            />

                            <InputError message={errors.terms} />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 h-11 w-full rounded-lg bg-accent font-semibold text-black hover:bg-accent/90 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-70"
                            tabIndex={6}
                            disabled={processing}
                            data-test="register-user-button"
                        >
                            {processing && <Spinner />}
                            Criar conta
                        </Button>
                    </div>

                    <div className="text-center text-sm text-zinc-400">
                        Já tem uma conta?{' '}
                        <TextLink
                            href={login()}
                            tabIndex={7}
                            className="font-medium text-white underline-offset-4 hover:text-accent hover:underline"
                        >
                            Entrar
                        </TextLink>
                    </div>
                </>
            )}
        </Form>
    );
}
