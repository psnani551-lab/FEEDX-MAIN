import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI, Notification } from '@/lib/api';

/**
 * Custom hook for managing notifications with React Query caching
 * Provides automatic caching, background refetching, and optimistic updates
 */
export function useNotifications() {
    const queryClient = useQueryClient();

    // Query for fetching all notifications
    const {
        data: notifications = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationsAPI.getAll,
        staleTime: 2 * 60 * 1000, // 2 minutes - notifications are very time-sensitive
        gcTime: 10 * 60 * 1000,
    });

    // Mutation for creating notifications
    const createMutation = useMutation({
        mutationFn: notificationsAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    // Mutation for updating notifications
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Notification> }) =>
            notificationsAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    // Mutation for updating status
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            notificationsAPI.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    // Mutation for deleting notifications
    const deleteMutation = useMutation({
        mutationFn: notificationsAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    return {
        notifications,
        isLoading,
        error,
        refetch,
        createNotification: createMutation.mutate,
        updateNotification: updateMutation.mutate,
        updateStatus: updateStatusMutation.mutate,
        deleteNotification: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
