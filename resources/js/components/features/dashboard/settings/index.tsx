import { Settings } from 'lucide-react';
import { useWorkspace } from '@/components/features/dashboard/workspace-context';
import { Button, Checkbox, Input, Label } from '@/components/ui';
import { toast } from 'sonner';

export function SettingsModule() {
    const { canAccessSettings } = useWorkspace();

    if (!canAccessSettings) {
        return (
            <div className="space-y-4">
                <div className="flex h-[60px] items-center">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <h2 className="ml-3 text-lg font-semibold">
                        Configurações restritas
                    </h2>
                </div>
                <p className="text-muted-foreground">
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
        <div className="space-y-6">
            <div className="flex h-[60px] items-center">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <h2 className="ml-3 text-lg font-semibold">
                    Configurações da Empresa
                </h2>
            </div>

            <div className="space-y-4">
                <div className="rounded-lg border p-4">
                    <h3 className="mb-4 font-medium">Dados da Empresa</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="companyName">Nome da Empresa</Label>
                            <Input
                                id="companyName"
                                defaultValue="Operis SaaS"
                            />
                        </div>
                        <div>
                            <Label htmlFor="companyEmail">E-mail</Label>
                            <Input
                                id="companyEmail"
                                type="email"
                                defaultValue="contato@operis.com.br"
                            />
                        </div>
                        <div>
                            <Label htmlFor="companyPhone">Telefone</Label>
                            <Input
                                id="companyPhone"
                                type="tel"
                                defaultValue="(11) 99999-9999"
                            />
                        </div>
                        <div>
                            <Label htmlFor="companyAddress">Endereço</Label>
                            <Input
                                id="companyAddress"
                                placeholder="Rua das Flores, 100"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="companyCNPJ">CNPJ</Label>
                            <Input
                                id="companyCNPJ"
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <h3 className="mb-4 font-medium">
                        Preferências do Sistema
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="dateFormat">Formato de Data</Label>
                            <Input id="dateFormat" defaultValue="DD/MM/YYYY" />
                        </div>
                        <div>
                            <Label htmlFor="timeFormat">Formato de Hora</Label>
                            <Input id="timeFormat" defaultValue="HH:mm" />
                        </div>
                        <div>
                            <Label htmlFor="currency">Moeda</Label>
                            <Input id="currency" defaultValue="BRL" />
                        </div>
                        <div>
                            <Label htmlFor="timezone">Fuso Horário</Label>
                            <Input
                                id="timezone"
                                defaultValue="America/Sao_Paulo"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <h3 className="mb-4 font-medium">Aparência</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="theme">Tema</Label>
                            <Input id="theme" defaultValue="light" />
                        </div>
                        <div>
                            <Label htmlFor="primaryColor">Cor Primária</Label>
                            <Input
                                id="primaryColor"
                                type="color"
                                defaultValue="#0ea5e9"
                            />
                        </div>
                        <div>
                            <Label htmlFor="sidebarWidth">
                                Largura da Sidebar
                            </Label>
                            <Input id="sidebarWidth" defaultValue="250" />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <h3 className="mb-4 font-medium">Notificações</h3>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <Checkbox id="emailNotifications" defaultChecked />
                            <Label
                                htmlFor="emailNotifications"
                                className="ml-2 w-full"
                            >
                                Notificações por e-mail
                            </Label>
                        </div>
                        <div className="flex items-start">
                            <Checkbox
                                id="browserNotifications"
                                defaultChecked
                            />
                            <Label
                                htmlFor="browserNotifications"
                                className="ml-2 w-full"
                            >
                                Notificações do navegador
                            </Label>
                        </div>
                        <div className="flex items-start">
                            <Checkbox id="systemNotifications" defaultChecked />
                            <Label
                                htmlFor="systemNotifications"
                                className="ml-2 w-full"
                            >
                                Notificações do sistema
                            </Label>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <h3 className="mb-4 font-medium">Segurança</h3>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <Checkbox
                                id="requireStrongPassword"
                                defaultChecked
                            />
                            <Label
                                htmlFor="requireStrongPassword"
                                className="ml-2 w-full"
                            >
                                Exigir senha forte
                            </Label>
                        </div>
                        <div className="flex items-start">
                            <Checkbox id="twoFactorAuth" />
                            <Label
                                htmlFor="twoFactorAuth"
                                className="ml-2 w-full"
                            >
                                Autenticação de dois fatores (2FA)
                            </Label>
                        </div>
                        <div className="flex items-start">
                            <Checkbox id="sessionTimeout" defaultChecked />
                            <Label
                                htmlFor="sessionTimeout"
                                className="ml-2 w-full"
                            >
                                Timeout de sessão após inatividade
                            </Label>
                        </div>
                        <div className="flex items-start">
                            <Label htmlFor="timeoutMinutes">
                                Tempo de timeout (minutos)
                            </Label>
                            <Input
                                id="timeoutMinutes"
                                type="number"
                                defaultValue="30"
                                className="ml-2 w-20"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <h3 className="mb-4 font-medium">Usuários e Permissões</h3>
                    <p className="text-muted-foreground">
                        Gestão de usuários e perfis de acesso será implementada
                        em futuras atualizações.
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave}>Salvar Configurações</Button>
            </div>
        </div>
    );
}
