import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useConfirmationHelpers } from '../contexts/ConfirmationContext';
import { useError } from '../contexts/ErrorContext';

interface UseCatalogSelectOptions<T> {
  /** React Query cache key, e.g. ['tire-brands']. */
  queryKey: string[];
  /** Authenticated fetch returning full records (needed for edit/delete). */
  fetchAll: () => Promise<T[]>;
  /** Public fetch returning names only, used when the user can't see the full list. */
  fetchNames: () => Promise<string[]>;
  /** Builds a read-only stand-in record from a name for the public fallback. */
  toFallbackItem: (name: string) => T;
  remove: (id: string) => Promise<unknown>;
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  /** Singular, lowercase, e.g. "brand" — used in confirm/error copy. */
  entityLabel: string;
  /** Called after a successful delete so the caller can clear a stale selection. */
  onDeleted?: (item: T) => void;
}

/**
 * Shared wiring for the small managed catalogs behind CrudAutocomplete (tire
 * brands, sizes, locations). Owns the list query, the delete flow and the
 * add/edit dialog state so each *Select component is just markup.
 *
 * Permissions mirror the API guards on server/src/tires/tires.controller.ts:
 * create/update allow ADMIN, FOREMAN, SUPERVISOR and STAFF; delete excludes
 * STAFF. Gating here keeps STAFF from clicking a button that can only 403.
 */
export function useCatalogSelect<T>({
  queryKey,
  fetchAll,
  fetchNames,
  toFallbackItem,
  remove,
  getId,
  getLabel,
  entityLabel,
  onDeleted,
}: UseCatalogSelectOptions<T>) {
  const queryClient = useQueryClient();
  const { confirmDelete } = useConfirmationHelpers();
  const { showError } = useError();
  const { isAdmin, isForeman, isSupervisor, isStaff } = useAuth();

  const hasManageRole = isAdmin || isForeman || isSupervisor || isStaff;
  const hasDeleteRole = isAdmin || isForeman || isSupervisor;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<{ items: T[]; isFallback: boolean }> => {
      try {
        return { items: await fetchAll(), isFallback: false };
      } catch (error: any) {
        // Callers without list access still need to *read* the names to fill
        // the field, so fall back to the public names-only endpoint.
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          const names = await fetchNames();
          return { items: names.map(toFallbackItem), isFallback: true };
        }
        throw error;
      }
    },
  });

  const items = data?.items ?? [];
  // Fallback records are reconstructed from names and have no real id, so they
  // must never reach an update/delete URL — that produced
  // `PUT /api/tires/locations/Wherehouse` and a "not found" from the API.
  // If we couldn't read the real list, we can't manage it either.
  const isFallback = data?.isFallback ?? false;

  const deleteMutation = useMutation({
    mutationFn: (item: T) => remove(getId(item)),
    onSettled: () => setDeletingItem(null),
    onSuccess: (_data, item) => {
      queryClient.invalidateQueries({ queryKey });
      onDeleted?.(item);
    },
    onError: (error: any) => {
      // The API returns 409 when the row is still referenced by tires. That is
      // the common case and deserves a plain explanation, not a stack trace.
      const apiMessage = error?.response?.data?.message;
      showError({
        title: `Could not delete ${entityLabel}`,
        message:
          apiMessage ||
          `Something went wrong deleting this ${entityLabel}. Please try again.`,
      });
    },
  });

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditingItem(item);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingItem(null);
  }, []);

  const requestDelete = useCallback(
    async (item: T) => {
      const confirmed = await confirmDelete(
        `the ${entityLabel} "${getLabel(item)}"`
      );
      if (!confirmed) return;
      setDeletingItem(item);
      deleteMutation.mutate(item);
    },
    [confirmDelete, deleteMutation, entityLabel, getLabel]
  );

  return {
    items,
    isLoading,
    canManage: hasManageRole && !isFallback,
    canDelete: hasDeleteRole && !isFallback,
    dialogOpen,
    editingItem,
    openAdd,
    openEdit,
    closeDialog,
    requestDelete,
    pendingDeleteId: deletingItem ? getId(deletingItem) : null,
  };
}
