import * as React from 'react';
import { StateCityFilter } from '@/components/filters/state-city-filter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { initialSupplierForm } from '@/constants/dashboard-form-initials';
import { useFormState } from '@/hooks/use-form-state';
import { Supplier } from '@/lib/mocks/mock-data';
import type { SupplierCreateDialogProps } from '@/types/dashboard-forms';
import { composeSupplierAddress } from '@/utils/suppliers';

export function SupplierCreateDialog({ open, onOpenChange, onSubmit }: SupplierCreateDialogProps) {
    const { form, setField } = useFormState(initialSupplierForm, open);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] sm:!max-w-[920px]">
                <DialogHeader>
                    <DialogTitle>Novo Fornecedor</DialogTitle>
                    <DialogDescription>
                        Preencha os dados principais e endereco do fornecedor.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();

                        const payload = {
                            id: '',
                            createdAt: '',
                            name: form.name,
                            email: form.email,
                            phone: form.phone,
                            document: form.document,
                            state: form.state,
                            city: form.city,
                            address: composeSupplierAddress(form),
                        } as Supplier;

                        onSubmit(payload);
                    }}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-name">Nome</Label>
                            <Input
                                id="supplier-name"
                                value={form.name}
                                onChange={(event) =>
                                    setField('name', event.target.value)
                                }
                                placeholder="Razao social ou nome fantasia"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-email">Email</Label>
                            <Input
                                id="supplier-email"
                                type="email"
                                value={form.email}
                                onChange={(event) =>
                                    setField('email', event.target.value)
                                }
                                placeholder="contato@fornecedor.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-phone">Telefone</Label>
                            <Input
                                id="supplier-phone"
                                value={form.phone}
                                onChange={(event) =>
                                    setField('phone', event.target.value)
                                }
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-document">Documento</Label>
                            <Input
                                id="supplier-document"
                                value={form.document}
                                onChange={(event) =>
                                    setField('document', event.target.value)
                                }
                                placeholder="CNPJ ou CPF"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Localidade</Label>
                        <StateCityFilter
                            stateValue={form.state}
                            cityValue={form.city}
                            onStateChange={(state) =>
                                setField('state', state)
                            }
                            onCityChange={(city) =>
                                setField('city', city)
                            }
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-street">Rua</Label>
                            <Input
                                id="supplier-street"
                                value={form.street}
                                onChange={(event) =>
                                    setField('street', event.target.value)
                                }
                                placeholder="Ex.: Rua das Flores"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-neighborhood">Bairro</Label>
                            <Input
                                id="supplier-neighborhood"
                                value={form.neighborhood}
                                onChange={(event) =>
                                    setField('neighborhood', event.target.value)
                                }
                                placeholder="Ex.: Centro"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-number">Numero</Label>
                            <Input
                                id="supplier-number"
                                value={form.number}
                                onChange={(event) =>
                                    setField('number', event.target.value)
                                }
                                placeholder="Ex.: 120"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supplier-zip">CEP</Label>
                            <Input
                                id="supplier-zip"
                                value={form.zipCode}
                                onChange={(event) =>
                                    setField('zipCode', event.target.value)
                                }
                                placeholder="00000-000"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Salvar fornecedor</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
