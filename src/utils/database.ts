
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
  }: DatabaseOperation): Promise<{ data: T[] | T | null; error: any }> {
    const operationLabel = `db.${table}.${operation}`;
    
    return PerformanceMonitor.measureAsync(operationLabel, async () => {
      try {
        let query = supabase.from(table);

        switch (operation) {
          case 'select':
            query = query.select(select);
            break;
          
          case 'insert':
            if (!data) throw new Error('Data required for insert operation');
            query = query.insert(data).select(select);
            break;
          
          case 'update':
            if (!data) throw new Error('Data required for update operation');
            query = query.update(data).select(select);
            break;
          
          case 'upsert':
            if (!data) throw new Error('Data required for upsert operation');
            query = query.upsert(data).select(select);
            break;
          
          case 'delete':
            query = query.delete().select(select);
            break;
        }

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });

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
    return data || [];
  }

  static async findOne<T = any>(table: string, filters: Record<string, any>, select = '*'): Promise<T | null> {
    const { data, error } = await this.execute<T[]>({
      table,
      operation: 'select',
      filters,
      select
    });
    
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data[0] || null : data;
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
    return data || [];
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
