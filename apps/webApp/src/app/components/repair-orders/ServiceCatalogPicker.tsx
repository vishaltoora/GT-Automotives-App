import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import { Close, Search, ExpandMore, AddCircleOutline } from '@mui/icons-material';
import {
  SERVICE_CATALOG,
  ALL_CATALOG_SERVICES,
  CatalogService,
} from './serviceCatalog';

interface ServiceCatalogPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (service: CatalogService) => void;
}

function priceLabel(price: number) {
  return price > 0 ? `$${price.toFixed(2)}` : 'Quote';
}

export function ServiceCatalogPicker({ open, onClose, onSelect }: ServiceCatalogPickerProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return ALL_CATALOG_SERVICES.filter(
      (s) =>
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [query]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleSelect = (service: CatalogService) => {
    onSelect(service);
    setQuery('');
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { height: '80vh' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Choose a Service</Typography>
        <IconButton onClick={handleClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          autoFocus
          placeholder="Search services…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DialogContent sx={{ pt: 0 }}>
        {filtered ? (
          // ---- Search results ----
          filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
              <Typography variant="body2">No services match "{query}".</Typography>
              <Typography variant="caption">You can still add it as a custom item.</Typography>
            </Box>
          ) : (
            <List dense>
              {filtered.map((s) => (
                <ListItemButton key={`${s.category}-${s.description}`} onClick={() => handleSelect(s)}>
                  <ListItemText
                    primary={s.description}
                    secondary={s.category}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                  <Chip label={priceLabel(s.unitPrice)} size="small" variant="outlined" sx={{ mr: 1 }} />
                  <AddCircleOutline fontSize="small" color="action" />
                </ListItemButton>
              ))}
            </List>
          )
        ) : (
          // ---- Categorized accordions ----
          SERVICE_CATALOG.map((cat, idx) => (
            <Accordion key={cat.name} defaultExpanded={idx === 0} disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                <Typography variant="subtitle2" fontWeight={600}>{cat.name}</Typography>
                <Chip label={cat.services.length} size="small" sx={{ ml: 1, height: 20 }} />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <Divider />
                <List dense disablePadding>
                  {cat.services.map((s) => (
                    <ListItemButton key={s.description} onClick={() => handleSelect(s)}>
                      <ListItemText primary={s.description} primaryTypographyProps={{ variant: 'body2' }} />
                      <Chip label={priceLabel(s.unitPrice)} size="small" variant="outlined" sx={{ mr: 1 }} />
                      <AddCircleOutline fontSize="small" color="action" />
                    </ListItemButton>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
}
