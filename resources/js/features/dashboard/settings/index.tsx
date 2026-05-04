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
    ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    Button,
    Checkbox,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui';
import { useWorkspace } from '@/features/dashboard/workspace-context';

export function SettingsModule() {
    const { canAccessSettings, currentCompany } = useWorkspace();
    const [primaryColor, setPrimaryColor] = useState(
        currentCompany.primaryColor || '#f97316',
    );

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
                            <Select defaultValue="DD/MM/YYYY">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DD/MM/YYYY">
                                        DD/MM/YYYY
                                    </SelectItem>
                                    <SelectItem value="MM/DD/YYYY">
                                        MM/DD/YYYY
                                    </SelectItem>
                                    <SelectItem value="YYYY-MM-DD">
                                        YYYY-MM-DD
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <Clock className="mr-1 inline h-3 w-3" />
                                Formato de Hora
                            </Label>
                            <Select defaultValue="HH:mm">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HH:mm">
                                        HH:mm (24h)
                                    </SelectItem>
                                    <SelectItem value="hh:mm A">
                                        hh:mm A (12h)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <Coins className="mr-1 inline h-3 w-3" />
                                Moeda
                            </Label>
                            <Select defaultValue="BRL">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BRL">
                                        Real (R$)
                                    </SelectItem>
                                    <SelectItem value="USD">
                                        Dólar ($)
                                    </SelectItem>
                                    <SelectItem value="EUR">
                                        Euro (€)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <Globe className="mr-1 inline h-3 w-3" />
                                Fuso Horário
                            </Label>
                            <Select defaultValue="America/Sao_Paulo">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="America/Sao_Paulo">
                                        Brasília
                                    </SelectItem>
                                    <SelectItem value="America/Manaus">
                                        Manaus
                                    </SelectItem>
                                    <SelectItem value="America/Fortaleza">
                                        Fortaleza
                                    </SelectItem>
                                    <SelectItem value="America/Recife">
                                        Recife
                                    </SelectItem>
                                </SelectContent>
                            </Select>
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
                            <Select defaultValue="light">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Claro</SelectItem>
                                    <SelectItem value="dark">Escuro</SelectItem>
                                    <SelectItem value="system">
                                        Seguir sistema
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm text-muted-foreground">
                                <Palette className="mr-1 inline h-3 w-3" />
                                Cor Primária
                            </Label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) =>
                                        setPrimaryColor(e.target.value)
                                    }
                                    className="h-10 w-10 cursor-pointer rounded-lg border-0 p-0"
                                />
                                <Input
                                    type="text"
                                    value={primaryColor}
                                    onChange={(e) =>
                                        setPrimaryColor(e.target.value)
                                    }
                                    placeholder="#f97316"
                                    className="font-mono uppercase"
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
