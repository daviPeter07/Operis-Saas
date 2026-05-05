import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPasswordPageContent({ token, email }: Props) {
    return (
        <Form
            {...update.form()}
            transform={(data) => ({ ...data, token, email })}
            resetOnSuccess={['password', 'password_confirmation']}
        >
            {({ processing, errors }) => (
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
                            autoComplete="email"
                            value={email}
                            className="h-11 border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus-visible:border-accent focus-visible:ring-accent/30"
                            readOnly
                        />
                        <InputError message={errors.email} className="mt-2" />
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
                            name="password"
                            autoComplete="new-password"
                            className="h-11 border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus-visible:border-accent focus-visible:ring-accent/30"
                            autoFocus
                            placeholder="Senha"
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
                            name="password_confirmation"
                            autoComplete="new-password"
                            className="h-11 border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus-visible:border-accent focus-visible:ring-accent/30"
                            placeholder="Confirmar senha"
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        disabled={processing}
                        data-test="reset-password-button"
                    >
                        {processing && <Spinner />}
                        Redefinir senha
                    </Button>
                </div>
            )}
        </Form>
    );
}
