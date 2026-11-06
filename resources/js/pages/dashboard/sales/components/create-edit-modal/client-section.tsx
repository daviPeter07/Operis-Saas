import { UserPlus } from 'lucide-react';
import { InputSearchComplete } from '@/components/input-search-complete';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ClientSectionProps } from '../../utils/types';

export function ClientSection({
    form,
    clientOptions,
    onCreateClient,
}: ClientSectionProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Cliente</CardTitle>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Criar cliente"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => onCreateClient('')}
                            >
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Criar cliente</TooltipContent>
                    </Tooltip>
                </div>
            </CardHeader>
            <CardContent>
                <InputSearchComplete
                    value={form.clientId}
                    onChange={form.setClientId}
                    options={clientOptions}
                    ariaLabel="Cliente da venda"
                    placeholder="Buscar cliente"
                    emptyMessage="Nenhum cliente encontrado."
                    onCreateOption={onCreateClient}
                    createOptionLabel={(query) => `Cadastrar "${query}"`}
                />
            </CardContent>
        </Card>
    );
}
