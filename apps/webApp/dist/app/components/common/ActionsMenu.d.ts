import React from 'react';
export interface ActionItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    dividerAfter?: boolean;
    show?: boolean;
}
interface ActionsMenuProps {
    actions: ActionItem[];
    tooltip?: string;
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    id?: string;
}
declare const ActionsMenu: React.FC<ActionsMenuProps>;
export default ActionsMenu;
//# sourceMappingURL=ActionsMenu.d.ts.map