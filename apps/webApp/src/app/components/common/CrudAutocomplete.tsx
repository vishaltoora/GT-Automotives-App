import { ReactNode, SyntheticEvent, useState } from 'react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  alpha,
} from '@mui/material';
import { AddIcon, EditIcon, DeleteIcon } from '../../icons/standard.icons';
import { colors } from '../../theme/colors';

export interface CrudAutocompleteProps<T> {
  /** Field label, e.g. "Brand". */
  label: string;
  /**
   * Singular, lowercase name of the thing being picked, e.g. "brand". Used to
   * build the tooltips and aria-labels ("Add new brand", "Edit brand").
   */
  entityLabel: string;

  options: T[];
  value: T | null;
  onChange: (option: T | null) => void;
  getOptionId: (option: T) => string;
  getOptionLabel: (option: T) => string;
  /** Optional richer row content; defaults to the plain option label. */
  renderOptionContent?: (option: T) => ReactNode;
  /**
   * Extra text a row should match while typing, on top of its label — e.g. a
   * customer's phone number or business name. Return everything searchable.
   */
  getOptionSearchText?: (option: T) => string;
  /**
   * Per-row gate for the edit/delete buttons. Use when only some options are
   * editable — e.g. service types that exist in the database, versus hardcoded
   * fallbacks that have no id. Defaults to every row being manageable.
   */
  isOptionManageable?: (option: T) => boolean;

  /** Opens the create dialog. The button is hidden when omitted. */
  onAdd?: () => void;
  /** Per-row edit. The row's edit button is hidden when omitted. */
  onEdit?: (option: T) => void;
  /** Per-row delete. The row's delete button is hidden when omitted. */
  onDelete?: (option: T) => void;
  /** Id of the option currently being deleted — shows a spinner on that row. */
  pendingDeleteId?: string | null;

  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  size?: 'small' | 'medium';
  placeholder?: string;
}

/**
 * The standard picker for small managed catalogs (tire brands, sizes,
 * locations) — a list the user both selects from and maintains in place.
 *
 * Layout contract:
 * - **Add** sits inside the input on the right, ahead of the clear/dropdown
 *   indicators, so it reads as part of the field.
 * - **Edit / Delete** sit on each row of the dropdown, so they act on the row
 *   you are pointing at rather than only on the current selection.
 *
 * Callers own the data and the dialogs; this component owns the layout and the
 * event plumbing that keeps row buttons from selecting the row.
 *
 * @example
 * <CrudAutocomplete
 *   label="Brand"
 *   entityLabel="brand"
 *   options={brands}
 *   value={selectedBrand}
 *   onChange={(b) => onChange(b?.id ?? '', b?.name ?? '')}
 *   getOptionId={(b) => b.id}
 *   getOptionLabel={(b) => b.name}
 *   onAdd={handleAddNew}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   pendingDeleteId={deleteMutation.isPending ? pendingId : null}
 * />
 */
export function CrudAutocomplete<T>({
  label,
  entityLabel,
  options,
  value,
  onChange,
  getOptionId,
  getOptionLabel,
  renderOptionContent,
  getOptionSearchText,
  isOptionManageable,
  onAdd,
  onEdit,
  onDelete,
  pendingDeleteId,
  loading = false,
  disabled = false,
  error = false,
  helperText,
  required = false,
  size = 'medium',
  placeholder,
}: CrudAutocompleteProps<T>) {
  const [open, setOpen] = useState(false);

  const hasRowActions = Boolean(onEdit || onDelete);

  // A row button must not also pick the row. Suppressing mousedown keeps focus
  // on the input (so the listbox doesn't close from under the click), and
  // stopping the click keeps it from reaching the option's own handler.
  const swallow = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const runRowAction = (event: SyntheticEvent, action: () => void) => {
    swallow(event);
    // Close the list first: these actions open a dialog, and leaving the
    // popper open behind a modal traps focus in a confusing place.
    setOpen(false);
    action();
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, selected) =>
        getOptionId(option) === getOptionId(selected)
      }
      filterOptions={(opts, { inputValue }) => {
        const query = inputValue.trim().toLowerCase();
        if (!query) return opts;
        return opts.filter((option) => {
          const haystack = getOptionSearchText
            ? `${getOptionLabel(option)} ${getOptionSearchText(option)}`
            : getOptionLabel(option);
          return haystack.toLowerCase().includes(query);
        });
      }}
      loading={loading}
      disabled={disabled}
      size={size}
      // No dropdown arrow — the list still opens on click/focus of the input.
      // forcePopupIcon={false} is what actually drops it; popupIcon={null}
      // leaves an empty indicator button behind.
      forcePopupIcon={false}
      openOnFocus
      renderOption={(props, option) => {
        // MUI supplies `key` inside props; React 19 warns if it is spread.
        const { key, ...liProps } = props as typeof props & { key: string };
        const id = getOptionId(option);
        const isDeleting = pendingDeleteId === id;
        const rowManageable = isOptionManageable
          ? isOptionManageable(option)
          : true;

        return (
          <Box
            component="li"
            key={key}
            {...liProps}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}
          >
            <Box
              sx={{
                flexGrow: 1,
                minWidth: 0,
                overflow: 'hidden',
                // Custom content lays itself out (customer rows are multi-line);
                // only the plain label gets single-line truncation.
                ...(renderOptionContent
                  ? {}
                  : { textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
              }}
            >
              {renderOptionContent
                ? renderOptionContent(option)
                : getOptionLabel(option)}
            </Box>

            {hasRowActions && rowManageable && (
              <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.25 }}>
                {onEdit && (
                  <Tooltip title={`Edit ${entityLabel}`}>
                    <IconButton
                      size="small"
                      // Excluded from the tab order so keyboard users still
                      // move through options normally.
                      tabIndex={-1}
                      aria-label={`Edit ${getOptionLabel(option)}`}
                      onMouseDown={swallow}
                      onClick={(event) =>
                        runRowAction(event, () => onEdit(option))
                      }
                      sx={{ p: 0.5 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip title={`Delete ${entityLabel}`}>
                    {/* span keeps the tooltip working while disabled */}
                    <span>
                      <IconButton
                        size="small"
                        tabIndex={-1}
                        aria-label={`Delete ${getOptionLabel(option)}`}
                        disabled={isDeleting}
                        onMouseDown={swallow}
                        onClick={(event) =>
                          runRowAction(event, () => onDelete(option))
                        }
                        sx={{ p: 0.5, color: colors.semantic.error }}
                      >
                        {isDeleting ? (
                          <CircularProgress size={16} />
                        ) : (
                          <DeleteIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          sx={{
            // MUI absolutely positions the clear indicator against the right
            // edge of the input, which would float it past the Add button no
            // matter the DOM order. Putting it back in flow makes the row read
            // [clear] [add]; the reserved right padding goes with it.
            '& .MuiAutocomplete-endAdornment': {
              position: 'static',
              transform: 'none',
            },
            '& .MuiAutocomplete-inputRoot': {
              paddingRight: '9px !important',
            },
            // MUI pulls the clear indicator 2px right to tuck it under the
            // arrow we removed; that would overlap the Add button.
            '& .MuiAutocomplete-clearIndicator': {
              marginRight: 0,
            },
          }}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} />}
                  {/* Clear (X) sits ahead of Add, which anchors the right edge. */}
                  {params.InputProps.endAdornment}
                  {onAdd && !disabled && (
                    <Tooltip title={`Add new ${entityLabel}`}>
                      <IconButton
                        size="small"
                        aria-label={`Add new ${entityLabel}`}
                        onClick={onAdd}
                        sx={{
                          p: 0.5,
                          mr: 0.5,
                          borderRadius: '50%',
                          border: `2px solid ${colors.primary.main}`,
                          color: colors.primary.main,
                          '&:hover': {
                            borderColor: colors.primary.dark,
                            color: colors.primary.dark,
                            bgcolor: alpha(colors.primary.main, 0.08),
                          },
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}

export default CrudAutocomplete;
