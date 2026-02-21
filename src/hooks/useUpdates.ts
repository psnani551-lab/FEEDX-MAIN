import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updatesAPI, Update } from '@/lib/api';

/**
 * Custom hook for managing updates with React Query caching
 * Provides automatic caching, background refetching, and optimistic updates
 */
export function useUpdates() {
    const queryClient = useQueryClient();

    // Query for fetching all updates
    const {
        data: updates = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['updates'],
        queryFn: updatesAPI.getAll,
        staleTime: 3 * 60 * 1000, // 3 minutes - updates are more time-sensitive
        gcTime: 10 * 60 * 1000,
    });

    // Mutation for creating updates
    const createMutation = useMutation({
        mutationFn: updatesAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['updates'] });
        },
    });

    // Mutation for updating updates
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Update> }) =>
            updatesAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['updates'] });
        },
    });

    // Mutation for updating status
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updatesAPI.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['updates'] });
        },
    });

    // Mutation for deleting updates
    const deleteMutation = useMutation({
        mutationFn: updatesAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['updates'] });
        },
    });

    return {
        updates,
        isLoading,
        error,
        refetch,
        createUpdate: createMutation.mutate,
        updateUpdate: updateMutation.mutate,
        updateStatus: updateStatusMutation.mutate,
        deleteUpdate: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
