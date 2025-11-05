import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
  Alert,
  Avatar,
  Card,
  CardContent,
  Menu,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Engineering as StaffIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useAuth } from '@clerk/clerk-react';
import { useError } from '../../app/contexts/ErrorContext';
import { useConfirmation } from '../../app/contexts/ConfirmationContext';
import CreateUserDialog from '../../components/users/CreateUserDialog';
import EditUserDialog from '../../components/users/EditUserDialog';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const UserManagement: React.FC = () => {
  const { getToken } = useAuth();
  const { showError, showInfo } = useError();
  const { confirm } = useConfirmation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = await confirm({
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate ${user.firstName} ${user.lastName}? They will no longer be able to access the system.`,
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      severity: 'warning',
    });

    if (!confirmed) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate user');
      }

      showInfo('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deactivating user:', error);
      showError('Failed to deactivate user');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuUser(null);
  };

  const handleMenuEdit = () => {
    if (menuUser) {
      handleEditUser(menuUser);
    }
  };

  const handleMenuDelete = () => {
    if (menuUser) {
      handleDeleteUser(menuUser);
      handleMenuClose();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return <AdminIcon />;
      case 'STAFF':
        return <StaffIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role: string): 'primary' | 'warning' | 'default' => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'primary';
      case 'STAFF':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getAvatarInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      '#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', 
      '#00796b', '#c2185b', '#5d4037', '#616161', '#e64a19'
    ];
    const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return colors[charCode % colors.length];
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role.name === roleFilter;
    const matchesStatus = 
      !statusFilter || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderMobileCards = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {paginatedUsers.map((user) => (
        <Card key={user.id} sx={{ position: 'relative' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  fontSize: '1rem',
                  bgcolor: getAvatarColor(user.firstName + user.lastName),
                  flexShrink: 0,
                }}
              >
                {getAvatarInitials(user.firstName, user.lastName)}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, user)}
                    sx={{ ml: 1, flexShrink: 0 }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                  <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.email}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    icon={getRoleIcon(user.role.name)}
                    label={user.role.name}
                    variant="outlined"
                    color={getRoleColor(user.role.name)}
                    size="small"
                  />
                  <Chip
                    icon={user.isActive ? <ActiveIcon /> : <BlockIcon />}
                    label={user.isActive ? 'Active' : 'Inactive'}
                    variant="outlined"
                    color={user.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  Created {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{
        mb: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          User Management
        </Typography>
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={!isMobile && <RefreshIcon />}
            onClick={fetchUsers}
            size={isMobile ? 'small' : 'medium'}
            sx={{ flex: { xs: 1, sm: 0 } }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={!isMobile && <AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            size={isMobile ? 'small' : 'medium'}
            sx={{ flex: { xs: 1, sm: 0 } }}
          >
            Add User
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ mb: 2, p: { xs: 1.5, sm: 2 } }}>
        {isMobile ? (
          <>
            <Button
              variant="text"
              fullWidth
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              startIcon={<FilterListIcon />}
              endIcon={filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                justifyContent: 'space-between',
                textTransform: 'none',
                color: 'text.primary',
                mb: filtersExpanded ? 1.5 : 0,
              }}
            >
              Filters
            </Button>
            {filtersExpanded && (
              <Stack spacing={1.5}>
                <TextField
                  placeholder="Search users..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="STAFF">Staff</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}
          </>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search users..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="STAFF">Staff</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )}
      </Paper>

      {loading ? (
        <Alert severity="info">Loading users...</Alert>
      ) : filteredUsers.length === 0 ? (
        <Alert severity="info">No users found</Alert>
      ) : isMobile ? (
        <>
          {renderMobileCards()}
          <Paper sx={{ mt: 2 }}>
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        </>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '0.875rem',
                          bgcolor: getAvatarColor(user.firstName + user.lastName)
                        }}
                      >
                        {getAvatarInitials(user.firstName, user.lastName)}
                      </Avatar>
                      <Typography variant="body2">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role.name)}
                      label={user.role.name}
                      variant="outlined"
                      color={getRoleColor(user.role.name)}
                      size="small"
                      sx={{ minWidth: 80 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={user.isActive ? <ActiveIcon /> : <BlockIcon />}
                      label={user.isActive ? 'Active' : 'Inactive'}
                      variant="outlined"
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                      sx={{ minWidth: 80 }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deactivate">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user)}
                        color="error"
                        disabled={!user.isActive}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onUserCreated={() => {
          setCreateDialogOpen(false);
          fetchUsers();
        }}
      />

      {selectedUser && (
        <EditUserDialog
          open={editDialogOpen}
          user={selectedUser}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedUser(null);
          }}
          onUserUpdated={() => {
            setEditDialogOpen(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleMenuDelete}
          disabled={menuUser ? !menuUser.isActive : false}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Deactivate</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserManagement;