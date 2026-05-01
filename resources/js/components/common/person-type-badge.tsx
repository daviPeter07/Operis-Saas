import { Badge } from '@/components/ui/badge';
import { PERSON_TYPE_COLORS, PERSON_TYPE_LABELS } from '@/constants/person-type';
import type { ClientPersonType } from '@/types/dashboard-forms';

type PersonTypeBadgeProps = {
    personType: ClientPersonType;
};

export function PersonTypeBadge({ personType }: PersonTypeBadgeProps) {
    const colors = PERSON_TYPE_COLORS[personType];

    return (
        <Badge className={`${colors.bg} ${colors.text}`}>
            {PERSON_TYPE_LABELS[personType]}
        </Badge>
    );
}
