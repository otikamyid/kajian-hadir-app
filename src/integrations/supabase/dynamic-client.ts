
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { secureStorage } from '@/utils/security';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

class DynamicSupabaseClient {
  private client: SupabaseClient<Database> | null = null;
  private config: SupabaseConfig | null = null;

  initialize(config: SupabaseConfig) {
    this.config = config;
    this.client = createClient<Database>(config.url, config.anonKey);
    console.log('Supabase client initialized with custom config');
  }

  getClient(): SupabaseClient<Database> {
    if (!this.client) {
      // Fallback to default client if no custom config
      const defaultConfig = this.getDefaultConfig();
      if (defaultConfig) {
        this.initialize(defaultConfig);
      } else {
        throw new Error('Supabase belum dikonfigurasi. Silakan konfigurasi di Pengaturan Admin.');
      }
    }
    return this.client;
  }

  private getDefaultConfig(): SupabaseConfig | null {
    // Check secure storage for custom config
    const savedConfig = secureStorage.getItem('supabase_config');
    if (savedConfig) {
      try {
        return savedConfig;
      } catch (error) {
        console.error('Error parsing saved Supabase config:', error);
      }
    }

    // Fallback to hardcoded values (for development)
    const SUPABASE_URL = "https://siwtzurwqvlalpljwalk.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd3R6dXJ3cXZsYWxwbGp3YWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNjUyNzAsImV4cCI6MjA2NDg0MTI3MH0.34ihbpBYE-Uedm81nuhCZp-1ZMOx7SNcRp5JZiUh1rI";
    
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
    }

    return null;
  }

  isConfigured(): boolean {
    return this.client !== null || this.getDefaultConfig() !== null;
  }

  getCurrentConfig(): SupabaseConfig | null {
    return this.config || this.getDefaultConfig();
  }

  async testConnection(config: SupabaseConfig): Promise<boolean> {
    try {
      const testClient = createClient<Database>(config.url, config.anonKey);
      const { error } = await testClient.from('profiles').select('count').limit(1);
      return !error;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const dynamicSupabase = new DynamicSupabaseClient();
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    const client = dynamicSupabase.getClient();
    return client[prop as keyof SupabaseClient<Database>];
  }
});
