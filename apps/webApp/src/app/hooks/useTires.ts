import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useCallback } from 'react';
import TireService from '../services/tire.service';
import {
  TireResponseDto as ITire,
  CreateTireDto as ITireCreateInput,
  UpdateTireDto as ITireUpdateInput,
  TireSearchDto as ITireSearchParams,
} from '@gt-automotive/shared-dto';

// Query Keys
export const TIRE_QUERY_KEYS = {
  all: ['tires'] as const,
  lists: () => [...TIRE_QUERY_KEYS.all, 'list'] as const,
  list: (params: ITireSearchParams) => [...TIRE_QUERY_KEYS.lists(), params] as const,
  details: () => [...TIRE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TIRE_QUERY_KEYS.details(), id] as const,
  lowStock: () => [...TIRE_QUERY_KEYS.all, 'low-stock'] as const,
  inventoryReport: () => [...TIRE_QUERY_KEYS.all, 'inventory-report'] as const,
  brands: () => [...TIRE_QUERY_KEYS.all, 'brands'] as const,
  sizeSuggestions: (query: string) => [...TIRE_QUERY_KEYS.all, 'size-suggestions', query] as const,
};

// Custom hook for fetching paginated tire list
export function useTires(params: ITireSearchParams = {}) {
  return useQuery({
    queryKey: TIRE_QUERY_KEYS.list(params),
    queryFn: () => TireService.getTires(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Custom hook for fetching a single tire
export function useTire(id: string, enabled = true) {
  return useQuery({
    queryKey: TIRE_QUERY_KEYS.detail(id),
    queryFn: () => TireService.getTireById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Custom hook for fetching low stock tires
export function useLowStockTires(enabled = true) {
  return useQuery({
    queryKey: TIRE_QUERY_KEYS.lowStock(),
    queryFn: () => TireService.getLowStockTires(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

// Custom hook for fetching inventory report
export function useInventoryReport(
  params?: { startDate?: string; endDate?: string },
  enabled = true
) {
  return useQuery({
    queryKey: [...TIRE_QUERY_KEYS.inventoryReport(), params],
    queryFn: () => TireService.getInventoryReport(params),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Custom hook for fetching tire brands
export function useTireBrands() {
  return useQuery({
    queryKey: TIRE_QUERY_KEYS.brands(),
    queryFn: () => TireService.getTireBrands(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Custom hook for tire size suggestions
export function useTireSizeSuggestions(query: string, enabled = true) {
  return useQuery({
    queryKey: TIRE_QUERY_KEYS.sizeSuggestions(query),
    queryFn: () => TireService.getTireSizeSuggestions(query),
    enabled: enabled && query.length >= 2,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Mutation hook for creating a tire
export function useCreateTire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ITireCreateInput) => TireService.createTire(data),
    onSuccess: (newTire) => {
      // Invalidate and refetch tire lists
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.lowStock() });
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.inventoryReport() });
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.brands() });
      
      // Add the new tire to cache
      queryClient.setQueryData(TIRE_QUERY_KEYS.detail(newTire.id), newTire);
    },
  });
}

// Mutation hook for updating a tire
export function useUpdateTire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ITireUpdateInput }) =>
      TireService.updateTire(id, data),
    onSuccess: (updatedTire) => {
      // Update the tire in cache
      queryClient.setQueryData(TIRE_QUERY_KEYS.detail(updatedTire.id), updatedTire);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.lowStock() });
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.inventoryReport() });
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TIRE_QUERY_KEYS.detail(id) });

      // Snapshot previous value
      const previousTire = queryClient.getQueryData(TIRE_QUERY_KEYS.detail(id));

      // Optimistically update
      if (previousTire) {
        queryClient.setQueryData(TIRE_QUERY_KEYS.detail(id), {
          ...previousTire,
          ...data,
          updatedAt: new Date(),
        });
      }

      return { previousTire };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousTire) {
        queryClient.setQueryData(TIRE_QUERY_KEYS.detail(id), context.previousTire);
      }
    },
  });
}

// Mutation hook for deleting a tire
export function useDeleteTire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TireService.deleteTire(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: TIRE_QUERY_KEYS.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.lowStock() });
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.inventoryReport() });
    },
  });
}

// Mutation hook for stock adjustment
export function useStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      adjustment 
    }: { 
      id: string; 
      adjustment: { quantity: number; type: 'add' | 'remove' | 'set'; reason: string };
    }) => TireService.adjustStock(id, adjustment),
    onSuccess: (updatedTire) => {
      // Update tire in cache
      queryClient.setQueryData(TIRE_QUERY_KEYS.detail(updatedTire.id), updatedTire);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.lowStock() });
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.inventoryReport() });
    },
    onMutate: async ({ id, adjustment }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TIRE_QUERY_KEYS.detail(id) });

      // Snapshot previous value
      const previousTire = queryClient.getQueryData<ITire>(TIRE_QUERY_KEYS.detail(id));

      // Optimistically update stock
      if (previousTire) {
        let newQuantity = previousTire.quantity;
        
        switch (adjustment.type) {
          case 'add':
            newQuantity += adjustment.quantity;
            break;
          case 'remove':
            newQuantity = Math.max(0, newQuantity - adjustment.quantity);
            break;
          case 'set':
            newQuantity = adjustment.quantity;
            break;
        }

        queryClient.setQueryData(TIRE_QUERY_KEYS.detail(id), {
          ...previousTire,
          quantity: newQuantity,
          updatedAt: new Date(),
        });
      }

      return { previousTire };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousTire) {
        queryClient.setQueryData(TIRE_QUERY_KEYS.detail(id), context.previousTire);
      }
    },
  });
}

// Mutation hook for uploading tire images
export function useUploadTireImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tireId, file }: { tireId: string; file: File }) =>
      TireService.uploadImage(tireId, file),
    onSuccess: (newImage, { tireId }) => {
      // Update tire in cache to include new image
      const tire = queryClient.getQueryData<ITire>(TIRE_QUERY_KEYS.detail(tireId));
      if (tire) {
        const updatedTire = {
          ...tire,
          imageUrl: tire.imageUrl || newImage.url,
        };
        queryClient.setQueryData(TIRE_QUERY_KEYS.detail(tireId), updatedTire);
      }
      
      // Invalidate lists to show updated images
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.lists() });
    },
  });
}

// Mutation hook for deleting tire images
export function useDeleteTireImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tireId, imageId }: { tireId: string; imageId: string }) =>
      TireService.deleteImage(tireId, imageId),
    onSuccess: (_, { tireId, imageId }) => {
      // Update tire in cache to remove deleted image
      const tire = queryClient.getQueryData<ITire>(TIRE_QUERY_KEYS.detail(tireId));
      if (tire) {
        const updatedTire = {
          ...tire,
          imageUrl: tire.imageUrl?.includes(imageId) ? undefined : tire.imageUrl,
        };
        queryClient.setQueryData(TIRE_QUERY_KEYS.detail(tireId), updatedTire);
      }
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.lists() });
    },
  });
}

// Mutation hook for bulk price updates
export function useBulkUpdatePrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { id: string; price: number; cost?: number }[]) =>
      TireService.bulkUpdatePrices(updates),
    onSuccess: (updatedTires) => {
      // Update each tire in cache
      updatedTires.forEach(tire => {
        queryClient.setQueryData(TIRE_QUERY_KEYS.detail(tire.id), tire);
      });
      
      // Invalidate lists and reports
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.inventoryReport() });
    },
  });
}

// Custom hook for exporting tires
export function useExportTires() {
  return useMutation({
    mutationFn: (params: ITireSearchParams = {}) => TireService.exportTires(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tire-inventory-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

// Utility function to prefetch tire data
export function usePrefetchTire() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: TIRE_QUERY_KEYS.detail(id),
        queryFn: () => TireService.getTireById(id),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

// Utility function to invalidate all tire queries
export function useInvalidateTireQueries() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: TIRE_QUERY_KEYS.all });
  }, [queryClient]);
}