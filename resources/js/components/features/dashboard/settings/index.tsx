import {
    Building2,
    Mail,
    Phone,
    MapPin,
    CalendarDays,
    Clock,
    Coins,
    Globe,
    Palette,
    Bell,
    Shield,
    Users,
    Save,
    Check,
} from 'lucide-react';
import { useWorkspace } from '@/components/features/dashboard/workspace-context';
import { Button, Checkbox, Input, Label } from '@/components/ui';
import { toast } from 'sonner';
import { formatDateBR } from '@/lib/format';

export function SettingsModule() {
    const { canAccessSettings, currentCompany } = useWorkspace();

    if (!canAccessSettings) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Shield className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">
                    Configurações restritas
                </h2>
                <p className="mt-2 max-w-md text-muted-foreground">
                    Apenas administradores podem acessar configurações e
                    personalizações da empresa.
                </p>
            </div>
        );
    }

    const handleSave = () => {
        toast.success('Configurações salvas com sucesso');
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: currentCompany.primaryColor }}
                >
                    <Building2 className="h-7 w-7" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">
                        {currentCompany.name}
                    </h2>
                    <p className="text-muted-foreground">
                        {currentCompany.description}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border bg-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Dados da Empresa</h3>
                    </div>
                    <div className="mt-5 space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                Nome
                            </Label>
                            <Input
                                defaultValue={currentCompany.name}
                                className="bg-background"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <Mail className="mr-1 inline h-3 w-3" />
                                E-mail
                            </Label>
                            <Input
                                defaultValue="contato@dgcomputer.com.br"
                                className="bg-background"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <Phone className="mr-1 inline h-3 w-3" />
                                Telefone
                            </Label>
                            <Input
                                defaultValue="(11) 3333-4444"
                                className="bg-background"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <MapPin className="mr-1 inline h-3 w-3" />
                                Endereço
                            </Label>
                            <Input
                                defaultValue="Av. Paulista, 1000 - São Paulo, SP"
                                className="bg-background"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                CNPJ
                            </Label>
                            <Input
                                defaultValue="12.345.678/0001-99"
                                className="bg-background"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <CalendarDays className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">
                            Preferências do Sistema
                        </h3>
                    </div>
                    <div className="mt-5 space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <CalendarDays className="mr-1 inline h-3 w-3" />
                                Formato de Data
                            </Label>
                            <Input
                                defaultValue="DD/MM/YYYY"
                                className="bg-background"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <Clock className="mr-1 inline h-3 w-3" />
                                Formato de Hora
                            </Label>
                            <Input
                                defaultValue="HH:mm"
                                className="bg-background"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <Coins className="mr-1 inline h-3 w-3" />
                                Moeda
                            </Label>
                            <Input
                                defaultValue="BRL (R$)"
                                className="bg-background"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <Globe className="mr-1 inline h-3 w-3" />
                                Fuso Horário
                            </Label>
                            <Input
                                defaultValue="America/Sao_Paulo"
                                className="bg-background"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Palette className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Aparência</h3>
                    </div>
                    <div className="mt-5 space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                Tema
                            </Label>
                            <Input
                                defaultValue="light"
                                className="bg-background"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <Palette className="mr-1 inline h-3 w-3" />
                                Cor Primária
                            </Label>
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-10 w-10 rounded-lg border"
                                    style={{
                                        backgroundColor:
                                            currentCompany.primaryColor,
                                    }}
                                />
                                <Input
                                    defaultValue={currentCompany.primaryColor}
                                    className="bg-background"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                Cor Secundária
                            </Label>
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-10 w-10 rounded-lg border"
                                    style={{
                                        backgroundColor:
                                            currentCompany.secondaryColor,
                                    }}
                                />
                                <Input
                                    defaultValue={currentCompany.secondaryColor}
                                    className="bg-background"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Notificações</h3>
                    </div>
                    <div className="mt-5 space-y-4">
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                            <Checkbox
                                id="emailNotifications"
                                defaultChecked
                                className="mt-0.5"
                            />
                            <div className="grid gap-1">
                                <Label
                                    htmlFor="emailNotifications"
                                    className="cursor-pointer font-normal"
                                >
                                    Notificações por e-mail
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Receba alertas sobre vendas, estoque e
                                    faturas
                                </p>
                            </div>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                            <Checkbox
                                id="browserNotifications"
                                defaultChecked
                                className="mt-0.5"
                            />
                            <div className="grid gap-1">
                                <Label
                                    htmlFor="browserNotifications"
                                    className="cursor-pointer font-normal"
                                >
                                    Notificações do navegador
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Receba alertas em tempo real
                                </p>
                            </div>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                            <Checkbox
                                id="systemNotifications"
                                defaultChecked
                                className="mt-0.5"
                            />
                            <div className="grid gap-1">
                                <Label
                                    htmlFor="systemNotifications"
                                    className="cursor-pointer font-normal"
                                >
                                    Notificações do sistema
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Sons e alertas visuais na aplicação
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Segurança</h3>
                    </div>
                    <div className="mt-5 space-y-4">
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                            <Checkbox
                                id="requireStrongPassword"
                                defaultChecked
                                className="mt-0.5"
                            />
                            <div className="grid gap-1">
                                <Label
                                    htmlFor="requireStrongPassword"
                                    className="cursor-pointer font-normal"
                                >
                                    Exigir senha forte
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Mínimo 8 caracteres com números e símbolos
                                </p>
                            </div>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                            <Checkbox id="twoFactorAuth" className="mt-0.5" />
                            <div className="grid gap-1">
                                <Label
                                    htmlFor="twoFactorAuth"
                                    className="cursor-pointer font-normal"
                                >
                                    Autenticação de dois fatores (2FA)
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Adicione uma camada extra de segurança
                                </p>
                            </div>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                            <Checkbox
                                id="sessionTimeout"
                                defaultChecked
                                className="mt-0.5"
                            />
                            <div className="grid gap-1">
                                <Label
                                    htmlFor="sessionTimeout"
                                    className="cursor-pointer font-normal"
                                >
                                    Timeout de sessão
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Desconectar após inatividade
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Usuários e Permissões</h3>
                    </div>
                    <div className="mt-5">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">3 usuários</p>
                                    <p className="text-sm text-muted-foreground">
                                        1 admin, 1 supervisor, 1 usuário
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                Gerenciar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                </Button>
            </div>
        </div>
    );
}
