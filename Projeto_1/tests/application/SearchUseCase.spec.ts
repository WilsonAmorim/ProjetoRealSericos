import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchUseCase } from '../../src/application/use-cases/SearchUseCase';

describe('SearchUseCase', () => {
  let mockSupabase: any;
  let searchUseCase: SearchUseCase;

  beforeEach(() => {
    // Creating a chainable mock for Supabase
    const mockSelect = vi.fn().mockReturnThis();
    const mockIlike = vi.fn().mockResolvedValue({ data: [{ id: 1, nome_razao_social: 'Cliente Teste' }], error: null });
    const mockEq = vi.fn().mockResolvedValue({ data: [{ id: 1, num_serie: '123' }], error: null });

    mockSupabase = {
      from: vi.fn().mockImplementation((table) => {
        if (table === 'cliente') {
          return { select: () => ({ ilike: mockIlike }) };
        }
        if (table === 'ordens_servico') {
          return { select: () => ({ eq: vi.fn().mockResolvedValue({ data: [{ id_os: 1 }], error: null }) }) };
        }
        if (table === 'motores') {
          return { select: () => ({ eq: mockEq }) };
        }
        return { select: mockSelect, eq: mockEq, ilike: mockIlike };
      }),
    };

    searchUseCase = new SearchUseCase(mockSupabase);
  });

  it('should return empty arrays if query is empty', async () => {
    const result = await searchUseCase.execute('');
    expect(result).toEqual({ clientes: [], ordens_servico: [], motores: [] });
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('should fetch clients, os, and motors for a numeric query', async () => {
    const result = await searchUseCase.execute('123');
    
    expect(mockSupabase.from).toHaveBeenCalledWith('cliente');
    expect(mockSupabase.from).toHaveBeenCalledWith('ordens_servico');
    expect(mockSupabase.from).toHaveBeenCalledWith('motores');

    expect(result.clientes).toHaveLength(1);
    expect(result.ordens_servico).toHaveLength(1);
    expect(result.motores).toHaveLength(1);
  });

  it('should not search ordens_servico for non-numeric queries', async () => {
    const result = await searchUseCase.execute('abc');
    
    // The OS result should be forced to empty array internally without calling `.eq` on OS
    expect(result.ordens_servico).toEqual([]);
  });

  it('should throw an error if one of the queries fails', async () => {
    mockSupabase.from = vi.fn().mockImplementation((table) => {
      if (table === 'cliente') {
        return { select: () => ({ ilike: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }) }) };
      }
      return { select: () => ({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) };
    });

    await expect(searchUseCase.execute('123')).rejects.toThrow('Error fetching clients: DB Error');
  });
});
