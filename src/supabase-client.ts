import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_KEY = process.env.SUPABASE_KEY;

export const supabase = createClient(
  'https://xtyrxekcsaesyyopouhh.supabase.co', // Ganti dengan URL proyek Anda
  SUPABASE_KEY ?? ""// Ganti dengan kunci publik Supabase
);

export const supabaseAdmin = createClient(
  'https://xtyrxekcsaesyyopouhh.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0eXJ4ZWtjc2Flc3l5b3BvdWhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU0Nzc3NCwiZXhwIjoyMDUxMTIzNzc0fQ.47K32v-2ccduFSzCM__qYxaUSUBBvVB8hLj386iW00o'
)
