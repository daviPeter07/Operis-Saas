import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPasswordPageContent() {
    return (
        <Form {...store.form()} resetOnSuccess={['password']}>
            {({ processing, errors }) => (
                <div className="space-y-6">
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
                            placeholder="Senha"
                            autoComplete="current-password"
                            autoFocus
                            className="h-11 border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus-visible:border-accent focus-visible:ring-accent/30"
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center">
                        <Button
                            className="h-11 w-full rounded-lg bg-accent font-semibold text-black hover:bg-accent/90 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner />}
                            Confirmar senha
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
