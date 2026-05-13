import { SupabaseClient } from '@supabase/supabase-js';

export class SearchUseCase {
  constructor(private db: SupabaseClient) { }

  async execute(query: string, authenticatedDb?: SupabaseClient) {
    if (!query) {
      return { clientes: [], ordens_servico: [], motores: [] };
    }

    // Use the authenticated client if provided, otherwise fallback to default
    const db = authenticatedDb || this.db;
    const trimmedQuery = query.trim();
    const flexibleQuery = `%${trimmedQuery.replace(/\s+/g, '%')}%`;
    const isNumeric = !isNaN(Number(trimmedQuery));

    try {
      // Dispara todas as requisições ao banco SIMULTANEAMENTE
      const [clientsResponse, motorResponse, osResponse] = await Promise.all([

        // 1. Search Clientes
        db.from('cliente')
          .select('*')
          .or(`nome_razao_social.ilike.${flexibleQuery},nome_fantasia.ilike.${flexibleQuery},documento.ilike.${flexibleQuery}`)
          .limit(20),

        // 2. Search Motores (by serial number)
        db.from('motores')
          .select('*, cliente(*)')
          .ilike('num_serie', flexibleQuery)
          .limit(10),

        // 3. Search Ordens de Servico (if query is numeric)
        isNumeric
          ? db.from('ordens_servico')
            .select('*, motores(*, cliente(*))')
            .eq('id_os', Number(trimmedQuery))
          // Se não for número, já devolve uma promise resolvida vazia para não dar erro
          : Promise.resolve({ data: [] })
      ]);

      return {
        clientes: clientsResponse.data || [],
        motores: motorResponse.data || [],
        ordens_servico: osResponse.data || [],
      };
    } catch (err) {
      console.error('Erro na busca centralizada:', err);
      return { clientes: [], ordens_servico: [], motores: [] };
    }
  }
}