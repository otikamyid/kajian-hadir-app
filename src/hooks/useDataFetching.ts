
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { DatabaseManager, DatabaseOperation } from '@/utils/database';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

// Generic data fetching hook
export function useDataQuery<T = any>(
  queryKey: string[],
  operation: Omit<DatabaseOperation, 'operation'> & { operation: 'select' },
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      logger.debug(`Fetching data for query: ${queryKey.join('.')}`);
      const { data, error } = await DatabaseManager.execute<T>(operation);
      
      if (error) {
        logger.error(`Query failed: ${queryKey.join('.')}`, { error });
        throw new Error(error.message);
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Generic mutation hook
export function useDataMutation<T = any, TVariables = any>(
  operation: (variables: TVariables) => Promise<T>,
  options?: {
    onSuccess?: (data: T, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[][];
    showToast?: boolean;
  } & Omit<UseMutationOptions<T, Error, TVariables>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { showToast = true, invalidateQueries = [], ...mutationOptions } = options || {};

  return useMutation<T, Error, TVariables>({
    mutationFn: operation,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      if (showToast) {
        toast({
          title: "Success",
          description: "Operation completed successfully",
        });
      }
      
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      logger.error('Mutation failed', { error: error.message });
      
      if (showToast) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      
      options?.onError?.(error, variables);
    },
    ...mutationOptions,
  });
}

// Specific hooks for common entities
export function useParticipants(filters?: Record<string, any>) {
  return useDataQuery(
    ['participants', filters],
    {
      table: 'participants',
      operation: 'select',
      filters,
    }
  );
}

export function useSessions(filters?: Record<string, any>) {
  return useDataQuery(
    ['sessions', filters],
    {
      table: 'sessions',
      operation: 'select',
      filters,
    }
  );
}

export function useCreateParticipant() {
  return useDataMutation(
    async (data: any) => DatabaseManager.create('participants', data),
    {
      invalidateQueries: [['participants']],
    }
  );
}

export function useUpdateParticipant() {
  return useDataMutation(
    async ({ id, ...data }: { id: string } & any) => 
      DatabaseManager.update('participants', { id }, data),
    {
      invalidateQueries: [['participants']],
    }
  );
}

export function useDeleteParticipant() {
  return useDataMutation(
    async (id: string) => DatabaseManager.remove('participants', { id }),
    {
      invalidateQueries: [['participants']],
    }
  );
}

export function useCreateSession() {
  return useDataMutation(
    async (data: any) => DatabaseManager.create('sessions', data),
    {
      invalidateQueries: [['sessions']],
    }
  );
}

export function useUpdateSession() {
  return useDataMutation(
    async ({ id, ...data }: { id: string } & any) => 
      DatabaseManager.update('sessions', { id }, data),
    {
      invalidateQueries: [['sessions']],
    }
  );
}
