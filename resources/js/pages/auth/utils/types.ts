export type LoginPageContentProps = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export type ResetPasswordPageContentProps = {
    token: string;
    email: string;
};
