import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: cols, error } = await supabase.rpc('get_table_columns', { table_name: 'faturamento' });
  if (error) {
    console.error('Error fetching faturamento columns:', error.message);
  } else {
    console.log('faturamento columns:', cols);
  }
}

main();
