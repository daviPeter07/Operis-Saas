export type ServerValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};
