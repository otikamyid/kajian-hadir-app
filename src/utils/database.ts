
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { PerformanceMonitor } from '@/utils/logger';

export interface DatabaseOperation {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  data?: any;
  filters?: Record<string, any>;
  select?: string;
}

// Define the valid table names from our database
type TableName = 'participants' | 'kajian_sessions' | 'attendance' | 'profiles' | 'participant_invitations';

export class DatabaseManager {
  private static logOperation(operation: DatabaseOperation, success: boolean, details?: any) {
    logger.logDatabase(operation.operation, operation.table, success, {
      filters: operation.filters,
      hasData: !!operation.data,
      ...details
    });
  }

  static async execute<T = any>({
    table,
    operation,
    data,
    filters = {},
    select = '*'
  }: DatabaseOperation): Promise<{ data: T | T[] | null; error: any }> {
    const operationLabel = `db.${table}.${operation}`;
    
    return PerformanceMonitor.measureAsync(operationLabel, async () => {
      try {
        let query = supabase.from(table as TableName);

        switch (operation) {
          case 'select':
            query = query.select(select);
            break;
          
          case 'insert':
            if (!data) throw new Error('Data required for insert operation');
            return await query.insert(data).select(select);
          
          case 'update':
            if (!data) throw new Error('Data required for update operation');
            let updateQuery = query.update(data);
            
            // Apply filters for update
            Object.entries(filters).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                updateQuery = updateQuery.in(key, value);
              } else if (value !== undefined && value !== null) {
                updateQuery = updateQuery.eq(key, value);
              }
            });
            
            return await updateQuery.select(select);
          
          case 'upsert':
            if (!data) throw new Error('Data required for upsert operation');
            return await query.upsert(data).select(select);
          
          case 'delete':
            let deleteQuery = query.delete();
            
            // Apply filters for delete
            Object.entries(filters).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                deleteQuery = deleteQuery.in(key, value);
              } else if (value !== undefined && value !== null) {
                deleteQuery = deleteQuery.eq(key, value);
              }
            });
            
            return await deleteQuery.select(select);
        }

        // Apply filters for select
        if (operation === 'select') {
          Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (value !== undefined && value !== null) {
              query = query.eq(key, value);
            }
          });
        }

        const result = await query;
        
        this.logOperation({ table, operation, data, filters, select }, !result.error, {
          count: Array.isArray(result.data) ? result.data?.length : result.data ? 1 : 0
        });

        return result;
      } catch (error) {
        this.logOperation({ table, operation, data, filters, select }, false, { error });
        return { data: null, error };
      }
    });
  }

  // Convenience methods for common operations
  static async findMany<T = any>(table: string, filters: Record<string, any> = {}, select = '*'): Promise<T[]> {
    const { data, error } = await this.execute<T[]>({
      table,
      operation: 'select',
      filters,
      select
    });
    
    if (error) throw new Error(error.message);
    return (data as T[]) || [];
  }

  static async findOne<T = any>(table: string, filters: Record<string, any>, select = '*'): Promise<T | null> {
    const { data, error } = await this.execute<T[]>({
      table,
      operation: 'select',
      filters,
      select
    });
    
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data[0] || null : data as T;
  }

  static async create<T = any>(table: string, data: any, select = '*'): Promise<T> {
    const { data: result, error } = await this.execute<T>({
      table,
      operation: 'insert',
      data,
      select
    });
    
    if (error) throw new Error(error.message);
    return Array.isArray(result) ? result[0] : result!;
  }

  static async update<T = any>(table: string, filters: Record<string, any>, data: any, select = '*'): Promise<T> {
    const { data: result, error } = await this.execute<T>({
      table,
      operation: 'update',
      data,
      filters,
      select
    });
    
    if (error) throw new Error(error.message);
    return Array.isArray(result) ? result[0] : result!;
  }

  static async upsert<T = any>(table: string, data: any, select = '*'): Promise<T> {
    const { data: result, error } = await this.execute<T>({
      table,
      operation: 'upsert',
      data,
      select
    });
    
    if (error) throw new Error(error.message);
    return Array.isArray(result) ? result[0] : result!;
  }

  static async remove<T = any>(table: string, filters: Record<string, any>, select = '*'): Promise<T[]> {
    const { data, error } = await this.execute<T[]>({
      table,
      operation: 'delete',
      filters,
      select
    });
    
    if (error) throw new Error(error.message);
    return (data as T[]) || [];
  }
}

// Transaction utility for multiple operations
export class DatabaseTransaction {
  private operations: (() => Promise<any>)[] = [];

  add<T = any>(operation: () => Promise<T>): this {
    this.operations.push(operation);
    return this;
  }

  async execute(): Promise<any[]> {
    const results = [];
    
    logger.info(`Starting database transaction with ${this.operations.length} operations`);
    
    try {
      for (const operation of this.operations) {
        const result = await operation();
        results.push(result);
      }
      
      logger.info('Database transaction completed successfully');
      return results;
    } catch (error) {
      logger.error('Database transaction failed', { error });
      throw error;
    }
  }
}
