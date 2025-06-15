
import { z } from 'zod';

// Auth schemas
export const signInSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const signUpSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  phone: z.string().min(10, 'Nomor telepon tidak valid').max(15, 'Nomor telepon terlalu panjang'),
});

export const adminCodeSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  adminCode: z.string().min(1, 'Kode admin diperlukan'),
});

// Session schemas
export const sessionSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(200, 'Judul maksimal 200 karakter'),
  description: z.string().optional(),
  date: z.string().min(1, 'Tanggal diperlukan'),
  start_time: z.string().min(1, 'Waktu mulai diperlukan'),
  end_time: z.string().min(1, 'Waktu selesai diperlukan'),
  location: z.string().optional(),
  max_participants: z.number().min(1, 'Minimal 1 peserta').optional(),
});

// Participant schemas
export const participantSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon tidak valid').max(15, 'Nomor telepon terlalu panjang'),
});

// Supabase config schema
export const supabaseConfigSchema = z.object({
  url: z.string().url('URL Supabase tidak valid'),
  anonKey: z.string().min(1, 'Anon Key diperlukan'),
});

// Settings schema
export const settingsSchema = z.object({
  lateThresholdMinutes: z.number().min(0, 'Nilai tidak boleh negatif').max(60, 'Maksimal 60 menit'),
});

export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type AdminCodeData = z.infer<typeof adminCodeSchema>;
export type SessionData = z.infer<typeof sessionSchema>;
export type ParticipantData = z.infer<typeof participantSchema>;
export type SupabaseConfigData = z.infer<typeof supabaseConfigSchema>;
export type SettingsData = z.infer<typeof settingsSchema>;
