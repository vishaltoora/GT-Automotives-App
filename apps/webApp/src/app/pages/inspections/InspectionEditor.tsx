import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { Inspection, inspectionService } from '../../requests/inspection.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import { InspectionForm } from '../../components/inspections/InspectionForm';

export function InspectionEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showApiError } = useErrorHelpers();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);

  const inspectionListPath = useMemo(() => {
    const [rolePath] = location.pathname.split('/').filter(Boolean);
    return rolePath ? `/${rolePath}/inspections` : '/staff/inspections';
  }, [location.pathname]);

  useEffect(() => {
    const loadInspection = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setInspection(await inspectionService.getInspection(id));
      } catch (error) {
        showApiError(error, 'Failed to load inspection');
      } finally {
        setLoading(false);
      }
    };
    loadInspection();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!inspection) {
    return <Alert severity="error">Inspection not found.</Alert>;
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>Vehicle Inspection</Typography>
      </Stack>
      <InspectionForm
        inspection={inspection}
        onInspectionChange={setInspection}
        onDone={() => navigate(inspectionListPath)}
      />
    </Box>
  );
}
