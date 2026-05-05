import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function LoginPageContent({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            {status && (
                <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-center text-sm font-medium text-green-400">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
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
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="voce@empresa.com"
                                    className="h-11 border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus-visible:border-accent focus-visible:ring-accent/30"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-white"
                                    >
                                        Senha
                                    </Label>

                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm font-medium text-white underline-offset-4 hover:text-accent hover:underline"
                                            tabIndex={5}
                                        >
                                            Esqueceu a senha?
                                        </TextLink>
                                    )}
                                </div>

                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Digite sua senha"
                                    className="h-11 border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus-visible:border-accent focus-visible:ring-accent/30"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-zinc-700 bg-black data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-black"
                                />

                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm font-medium text-white"
                                >
                                    Lembrar de mim
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full rounded-lg bg-accent font-semibold text-black hover:bg-accent/90 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-70"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Entrar
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-zinc-400">
                                Ainda não tem conta?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={5}
                                    className="font-medium text-white underline-offset-4 hover:text-accent hover:underline"
                                >
                                    Criar conta
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}
