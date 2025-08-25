import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

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

const ActionsMenu: React.FC<ActionsMenuProps> = ({
  actions,
  tooltip = 'Actions',
  size = 'small',
  disabled = false,
  id,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: ActionItem) => {
    action.onClick();
    handleClose();
  };

  // Filter visible actions
  const visibleActions = actions.filter(action => action.show !== false);

  if (visibleActions.length === 0) {
    return null;
  }

  const menuId = id ? `${id}-menu` : 'actions-menu';

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          size={size}
          onClick={handleClick}
          disabled={disabled}
          aria-label={tooltip}
          aria-controls={open ? menuId : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              borderRadius: 2,
            }
          }
        }}
      >
        {visibleActions.map((action, index) => (
          <React.Fragment key={action.id}>
            <MenuItem
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              sx={{
                py: 1.5,
                px: 2,
                minHeight: 'auto',
                ...(action.color && action.color !== 'default' && {
                  color: `${action.color}.main`,
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  }
                })
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {action.icon}
              </ListItemIcon>
              <ListItemText 
                primary={action.label}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 500,
                }}
              />
            </MenuItem>
            {action.dividerAfter && index < visibleActions.length - 1 && (
              <Divider sx={{ my: 0.5 }} />
            )}
          </React.Fragment>
        ))}
      </Menu>
    </>
  );
};

export default ActionsMenu;