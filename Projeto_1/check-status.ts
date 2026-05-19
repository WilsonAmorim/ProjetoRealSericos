import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: statusRows, error } = await supabase.from('andamento_servico').select('*');
  if (error) {
    console.error('Error fetching andamentos:', error.message);
  } else {
    console.log('Status andamentos:', statusRows);
  }
}

main();
