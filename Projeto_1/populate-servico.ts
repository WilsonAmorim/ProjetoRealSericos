import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Fetch from tipo_servico
  const { data: tipoData } = await supabase.from('tipo_servico').select('*');
  
  if (tipoData && tipoData.length > 0) {
    const toInsert = tipoData.map(t => ({
      id_servico: t.id_tipo_servico,
      descricao_servico: t.descricao_tipo_servico
    }));
    
    // Insert into servico
    const { error } = await supabase.from('servico').insert(toInsert);
    if (error) {
       console.log('Error inserting:', error.message);
    } else {
       console.log('Successfully copied', toInsert.length, 'rows into servico table');
    }
  } else {
    console.log('No data found in tipo_servico');
  }
}

main();
