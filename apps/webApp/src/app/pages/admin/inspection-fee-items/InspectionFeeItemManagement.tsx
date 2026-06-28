import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  InspectionFeeItem,
  inspectionService,
} from '../../../requests/inspection.requests';
import { InspectionFeeItemDialog } from '../../../components/inspections/InspectionFeeItemDialog';
import { useErrorHelpers } from '../../../contexts/ErrorContext';
import { useConfirmation } from '../../../contexts/ConfirmationContext';

const typeLabel = (type?: string | null) => {
  if (!type) return '—';
  return type
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
};

export function InspectionFeeItemManagement() {
  const { showApiError } = useErrorHelpers();
  const { confirm } = useConfirmation();
  const [feeItems, setFeeItems] = useState<InspectionFeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<InspectionFeeItem | null>(null);

  useEffect(() => {
    loadFeeItems();
  }, []);

  const loadFeeItems = async () => {
    try {
      setLoading(true);
      const items = await inspectionService.getFeeItems();
      setFeeItems(items);
    } catch (error) {
      showApiError(error, 'Failed to load inspection items');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelected(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: InspectionFeeItem) => {
    setSelected(item);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    setDialogOpen(false);
    setSelected(null);
    void loadFeeItems();
  };

  const handleDelete = async (item: InspectionFeeItem) => {
    const confirmed = await confirm({
      title: 'Delete Inspection Item',
      message: `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      severity: 'error',
      confirmButtonColor: 'error',
    });
    if (!confirmed) return;

    try {
      await inspectionService.deleteFeeItem(item.id);
      setFeeItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      showApiError(error, 'Failed to delete inspection item');
    }
  };

  return (
    <Box p={{ xs: 1, md: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
          >
            Inspection Items &amp; Pricing
          </Typography>
          <Typography color="text.secondary">
            Manage the priced inspection line items used when invoicing
            inspections.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Item
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : feeItems.length === 0 ? (
        <Alert severity="info">
          No inspection items yet. Add one to start invoicing inspections.
        </Alert>
      ) : (
        <Card variant="outlined" sx={{ borderRadius: 1 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feeItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography fontWeight={600}>{item.name}</Typography>
                          {item.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.description}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>{typeLabel(item.type)}</TableCell>
                      <TableCell align="right">
                        ${Number(item.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.isActive ? 'Active' : 'Inactive'}
                          color={item.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(item)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(item)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <InspectionFeeItemDialog
        open={dialogOpen}
        feeItem={selected}
        onClose={() => {
          setDialogOpen(false);
          setSelected(null);
        }}
        onSaved={handleSaved}
      />
    </Box>
  );
}

export default InspectionFeeItemManagement;
