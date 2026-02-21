import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI, Event } from '@/lib/api';

/**
 * Custom hook for managing events with React Query caching
 * Provides automatic caching, background refetching, and optimistic updates
 */
export function useEvents() {
    const queryClient = useQueryClient();

    // Query for fetching all events
    const {
        data: events = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['events'],
        queryFn: eventsAPI.getAll,
        staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 min
        gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 min
    });

    // Mutation for creating events
    const createMutation = useMutation({
        mutationFn: eventsAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    // Mutation for updating events
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
            eventsAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    // Mutation for updating event status
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            eventsAPI.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    // Mutation for deleting events
    const deleteMutation = useMutation({
        mutationFn: eventsAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    return {
        events,
        isLoading,
        error,
        refetch,
        createEvent: createMutation.mutate,
        updateEvent: updateMutation.mutate,
        updateStatus: updateStatusMutation.mutate,
        deleteEvent: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
