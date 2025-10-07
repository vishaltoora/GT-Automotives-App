import { TireResponseDto as ITire } from '@gt-automotive/data';
interface TireCardProps {
    tire: ITire;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    showCost?: boolean;
    variant?: 'compact' | 'detailed';
    showActions?: boolean;
}
export declare function TireCard({ tire, onEdit, onDelete, onView, showCost, variant, showActions, }: TireCardProps): import("react/jsx-runtime").JSX.Element;
export default TireCard;
//# sourceMappingURL=TireCard.d.ts.map