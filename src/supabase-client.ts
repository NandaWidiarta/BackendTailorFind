import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_KEY = process.env.SUPABASE_KEY;

export const supabase = createClient(
  'https://xtyrxekcsaesyyopouhh.supabase.co', // Ganti dengan URL proyek Anda
  SUPABASE_KEY ?? ""// Ganti dengan kunci publik Supabase
);
