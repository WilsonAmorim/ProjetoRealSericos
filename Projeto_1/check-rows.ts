import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: servico } = await supabase.from('servico').select('*');
  console.log('servico rows:', servico?.length);

  const { data: pecas } = await supabase.from('pecas').select('*');
  console.log('pecas rows:', pecas?.length);
}

main();
