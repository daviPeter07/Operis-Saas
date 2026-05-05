import { Link } from '@inertiajs/react';
import { Check, Copy, Mail, ShieldCheck, UsersRound } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { WorkspaceRole, WorkspaceTeamAccessMode } from '@/types/workspace';

type TeamMember = {
    nome: string;
    email: string;
    senha: string;
    role: 'admin' | 'supervisor' | 'user';
    status: 'ativo' | 'inativo';
};

interface TeamPageContentProps {
    currentRole: WorkspaceRole;
    teamAccessMode: WorkspaceTeamAccessMode;
    requestAdminHref: string;
}

const initialMembers: TeamMember[] = [
    {
        nome: 'Rony Peterson',
        email: 'rony@operis.com',
        senha: '********',
        role: 'admin',
        status: 'ativo',
    },
    {
        nome: 'Davi Souza',
        email: 'davi@operis.com',
        senha: '********',
        role: 'supervisor',
        status: 'ativo',
    },
    {
        nome: 'Camila',
        email: 'camila@operis.com',
        senha: '********',
        role: 'user',
        status: 'inativo',
    },
];

const roleLabels: Record<TeamMember['role'], string> = {
    admin: 'Admin',
    supervisor: 'Supervisor',
    user: 'Usuário',
};

const statusLabels: Record<TeamMember['status'], string> = {
    ativo: 'Ativo',
    inativo: 'Inativo',
};

function getAvatarFromName(nome: string): string {
    const parts = nome.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return '?';
    }

    if (parts.length === 1) {
        return parts[0][0].toUpperCase();
    }

    const firstInitial = parts[0][0];
    const lastInitial = parts[parts.length - 1][0];

    return `${firstInitial}${lastInitial}`.toUpperCase();
}

export function TeamPageContent({
    currentRole,
    teamAccessMode,
    requestAdminHref,
}: TeamPageContentProps) {
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [managedMember, setManagedMember] = useState<TeamMember | null>(null);
    const [managedForm, setManagedForm] = useState<TeamMember | null>(null);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLink, setInviteLink] = useState('');
    const [inviteCopySuccess, setInviteCopySuccess] = useState(false);
    const isAdmin = currentRole === 'admin';
    const needsAdminRequest = teamAccessMode === 'request-admin';

    const summary = useMemo(() => {
        const activeMembers = members.filter(
            (member) => member.status === 'ativo',
        ).length;
        const leaders = members.filter(
            (member) => member.role !== 'user',
        ).length;
        const inactiveMembers = members.filter(
            (member) => member.status === 'inativo',
        ).length;

        return [
            {
                title: 'Membros totais',
                value: String(members.length),
                description: 'Total de usuários cadastrados na equipe.',
                icon: UsersRound,
            },
            {
                title: 'Membros ativos',
                value: String(activeMembers),
                description: 'Usuários com status ativo no sistema.',
                icon: ShieldCheck,
            },
            {
                title: 'Perfis de liderança',
                value: String(leaders),
                description: 'Usuários nos papéis admin e supervisor.',
                icon: ShieldCheck,
            },
            {
                title: 'Membros inativos',
                value: String(inactiveMembers),
                description: 'Usuários com acesso suspenso no momento.',
                icon: UsersRound,
            },
        ];
    }, [members]);

    useEffect(() => {
        if (!inviteDialogOpen) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInviteCopySuccess(false);
    }, [inviteDialogOpen]);

    function handleInviteSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const token = Math.random().toString(36).slice(2, 10).toUpperCase();
        const link = `https://operis.app/convite/equipe/${token}`;

        setInviteLink(link);
        setInviteDialogOpen(true);

        void navigator.clipboard.writeText(link).then(() => {
            setInviteCopySuccess(true);
            toast.success('Link copiado com sucesso.');
        });
    }

    function handleCopyInviteLink(): void {
        if (!inviteLink) {
            return;
        }

        void navigator.clipboard.writeText(inviteLink).then(() => {
            setInviteCopySuccess(true);
            toast.success('Link copiado com sucesso.');
        });
    }

    function handleSendEmail(): void {
        toast.success('Email de convite enviado.', {
            description: `Convite encaminhado para ${inviteEmail}.`,
        });

        setInviteDialogOpen(false);
        setInviteLink('');
        setInviteEmail('');
        setInviteCopySuccess(false);
    }

    function openManageDialog(member: TeamMember): void {
        setManagedMember(member);
        setManagedForm({ ...member });
    }

    function closeManageDialog(): void {
        setManagedMember(null);
        setManagedForm(null);
    }

    function handleManageSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (!managedForm || !managedMember) {
            return;
        }

        setMembers((currentMembers) =>
            currentMembers.map((member) =>
                member.email === managedMember.email ? managedForm : member,
            ),
        );

        closeManageDialog();
        toast.success('Informações do usuário atualizadas.');
    }

    return (
        <>
            <div className="space-y-4">
                <section className="rounded-2xl border bg-card p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-xs font-medium tracking-[0.24em] text-orange-500 uppercase">
                                Equipe
                            </p>
                            <h2 className="mt-2 text-xl font-semibold text-foreground">
                                Usuários e permissões de acesso.
                            </h2>
                            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                                Visualização compacta de membros com foco em
                                nome, email, senha, role e status.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {isAdmin ? (
                                <Button
                                    className="rounded-xl bg-orange-500 text-white hover:bg-orange-500/90"
                                    onClick={() => setAddMemberOpen(true)}
                                >
                                    <UsersRound className="mr-2 h-4 w-4" />
                                    Adicionar membro
                                </Button>
                            ) : needsAdminRequest ? (
                                <Link
                                    href={requestAdminHref}
                                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
                                >
                                    Solicitar ao admin
                                </Link>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="rounded-full px-3 py-1 text-xs"
                                >
                                    Somente visualização
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {summary.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-xl border border-border/70 bg-background/40 p-3"
                            >
                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {item.title}
                                </p>
                                <p className="mt-1 text-xl font-semibold text-foreground">
                                    {item.value}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl border bg-card p-3">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="font-semibold text-foreground">
                                Membros da equipe
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Exibição compacta sem IDs, timestamps e foto.
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="rounded-full px-3 py-1 text-xs"
                        >
                            {members.length} membros
                        </Badge>
                    </div>

                    <div className="space-y-2.5">
                        {members.map((member) => (
                            <div
                                key={member.email}
                                className="rounded-xl border border-border/70 bg-background/40 px-3 py-3"
                            >
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-xs font-semibold text-white">
                                            {getAvatarFromName(member.nome)}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-base font-semibold text-foreground">
                                                    {member.nome}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full text-[11px]"
                                                >
                                                    {roleLabels[member.role]}
                                                </Badge>
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-full text-[11px]"
                                                >
                                                    {
                                                        statusLabels[
                                                            member.status
                                                        ]
                                                    }
                                                </Badge>
                                            </div>

                                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span className="inline-flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5 text-orange-500" />
                                                    {member.email}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3">
                                        {isAdmin ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-lg"
                                                onClick={() =>
                                                    openManageDialog(member)
                                                }
                                            >
                                                Gerenciar
                                            </Button>
                                        ) : needsAdminRequest ? (
                                            <Link
                                                href={requestAdminHref}
                                                className="inline-flex h-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 text-sm font-medium text-orange-500 hover:bg-orange-500/15"
                                            >
                                                Solicitar gestão
                                            </Link>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="rounded-full px-3 py-1 text-xs"
                                            >
                                                Visualização
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl border bg-card p-4">
                    <div className="mb-4">
                        <h3 className="font-semibold text-foreground">
                            Enviar convite por email
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Fluxo visual para convite de novo usuário da equipe.
                        </p>
                    </div>

                    <form
                        onSubmit={handleInviteSubmit}
                        className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]"
                    >
                        <Input
                            type="email"
                            placeholder="Digite o email do usuário"
                            value={inviteEmail}
                            onChange={(event) =>
                                setInviteEmail(event.target.value)
                            }
                            required
                        />

                        <Button
                            type="submit"
                            className="bg-orange-500 text-white hover:bg-orange-500/90"
                        >
                            Enviar convite
                        </Button>
                    </form>
                </section>
            </div>

            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Adicionar membro</DialogTitle>
                        <DialogDescription>
                            Cadastro visual com campos essenciais do usuário.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Nome" placeholder="Nome completo" />
                        <Field
                            label="Email"
                            placeholder="email@empresa.com"
                            type="email"
                        />
                        <Field
                            label="Senha"
                            placeholder="********"
                            type="password"
                        />
                        <Field
                            label="Role"
                            placeholder="admin, supervisor ou user"
                        />
                        <Field label="Status" placeholder="ativo ou inativo" />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAddMemberOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="bg-orange-500 text-white hover:bg-orange-500/90"
                            onClick={() => {
                                setAddMemberOpen(false);
                                toast.success('Cadastro visual atualizado.');
                            }}
                        >
                            Salvar membro
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={managedMember !== null}
                onOpenChange={(open) => !open && closeManageDialog()}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Gerenciar membro</DialogTitle>
                        <DialogDescription>
                            Formulário de edição sem IDs, timestamps, foto e
                            avatar customizável.
                        </DialogDescription>
                    </DialogHeader>

                    {managedMember && managedForm ? (
                        <form
                            id="manage-member-form"
                            className="grid gap-4"
                            onSubmit={handleManageSubmit}
                        >
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="grid gap-2 text-sm text-foreground">
                                    <span>Nome</span>
                                    <Input
                                        value={managedForm.nome}
                                        onChange={(event) =>
                                            setManagedForm({
                                                ...managedForm,
                                                nome: event.target.value,
                                            })
                                        }
                                    />
                                </label>
                                <label className="grid gap-2 text-sm text-foreground">
                                    <span>Email</span>
                                    <Input
                                        type="email"
                                        value={managedForm.email}
                                        onChange={(event) =>
                                            setManagedForm({
                                                ...managedForm,
                                                email: event.target.value,
                                            })
                                        }
                                    />
                                </label>
                                <label className="grid gap-2 text-sm text-foreground">
                                    <span>Senha</span>
                                    <Input
                                        type="password"
                                        value={managedForm.senha}
                                        onChange={(event) =>
                                            setManagedForm({
                                                ...managedForm,
                                                senha: event.target.value,
                                            })
                                        }
                                    />
                                </label>
                                <label className="grid gap-2 text-sm text-foreground">
                                    <span>Role</span>
                                    <select
                                        value={managedForm.role}
                                        onChange={(event) =>
                                            setManagedForm({
                                                ...managedForm,
                                                role: event.target.value as
                                                    | 'admin'
                                                    | 'supervisor'
                                                    | 'user',
                                            })
                                        }
                                        className="h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
                                    >
                                        <option value="user">Usuário</option>
                                        <option value="supervisor">
                                            Supervisor
                                        </option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </label>
                                <label className="grid gap-2 text-sm text-foreground">
                                    <span>Status</span>
                                    <select
                                        value={managedForm.status}
                                        onChange={(event) =>
                                            setManagedForm({
                                                ...managedForm,
                                                status: event.target.value as
                                                    | 'ativo'
                                                    | 'inativo',
                                            })
                                        }
                                        className="h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
                                    >
                                        <option value="ativo">Ativo</option>
                                        <option value="inativo">Inativo</option>
                                    </select>
                                </label>
                            </div>
                        </form>
                    ) : null}

                    <DialogFooter>
                        <Button variant="outline" onClick={closeManageDialog}>
                            Fechar
                        </Button>
                        <Button
                            type="submit"
                            form="manage-member-form"
                            className="bg-orange-500 text-white hover:bg-orange-500/90"
                        >
                            Salvar alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Convite enviado</DialogTitle>
                        <DialogDescription>
                            O convite está pronto para ser copiado e enviado.
                            Copie o link abaixo e depois envie o email.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                            Link de convite
                        </p>
                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2">
                            <input
                                readOnly
                                value={inviteLink}
                                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                                onClick={handleCopyInviteLink}
                                aria-label="Copiar link de convite"
                            >
                                {inviteCopySuccess ? (
                                    <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setInviteDialogOpen(false);
                                setInviteCopySuccess(false);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="bg-orange-500 text-white hover:bg-orange-500/90"
                            onClick={handleSendEmail}
                        >
                            Enviar e-mail
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Field({
    label,
    placeholder,
    type = 'text',
}: {
    label: string;
    placeholder: string;
    type?: string;
}) {
    return (
        <label className="grid gap-2 text-sm text-foreground">
            <span>{label}</span>
            <Input type={type} placeholder={placeholder} />
        </label>
    );
}
