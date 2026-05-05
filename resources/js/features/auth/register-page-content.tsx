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
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                name="name"
                                placeholder="Seu nome completo"
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                name="email"
                                placeholder="voce@empresa.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <PasswordInput
                                id="password"
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                name="password"
                                placeholder="Crie uma senha"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Confirmar senha
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                name="password_confirmation"
                                placeholder="Repita sua senha"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="terms"
                                    checked={acceptedTerms}
                                    onCheckedChange={(checked) =>
                                        setAcceptedTerms(Boolean(checked))
                                    }
                                    tabIndex={5}
                                />
                                <Label
                                    htmlFor="terms"
                                    className="leading-relaxed text-muted-foreground"
                                >
                                    Eu li e aceito os termos de uso e a
                                    política de privacidade.
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
                            className="mt-2 w-full"
                            tabIndex={6}
                            data-test="register-user-button"
                        >
                            {processing && <Spinner />}
                            Criar conta
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        Já tem uma conta?{' '}
                        <TextLink href={login()} tabIndex={7}>
                            Entrar
                        </TextLink>
                    </div>
                </>
            )}
        </Form>
    );
}
