import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: servicoS, error: errS } = await supabase.from('servicos').select('*');
  console.log('servicos (plural) count:', servicoS?.length, 'error:', errS?.message);

  const { data: servico, error: err } = await supabase.from('servico').select('*');
  console.log('servico (singular) count:', servico?.length, 'error:', err?.message);
}

main();
