import { useQueryState } from 'nuqs';
import { useState } from 'react';

// Header quick actions link to `?action=<action>` to open a page's modal.
export function useUrlAction(
    action: string,
): [boolean, (open: boolean) => void] {
    const [urlAction, setUrlAction] = useQueryState('action', {
        history: 'replace',
    });
    const [isOpen, setIsOpen] = useState(false);

    const setOpen = (open: boolean) => {
        setIsOpen(open);

        if (!open && urlAction === action) {
            void setUrlAction(null);
        }
    };

    return [isOpen || urlAction === action, setOpen];
}
