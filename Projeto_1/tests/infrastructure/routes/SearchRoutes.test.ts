import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import searchRoutes from '../../../src/infrastructure/routes/searchRoutes';
import { SearchUseCase } from '../../../src/application/use-cases/SearchUseCase';

// Mock the SearchUseCase so we don't hit the real DB
vi.mock('../../../src/application/use-cases/SearchUseCase');

const app = express();
app.use(express.json());
app.use('/api/search', searchRoutes);

describe('Search Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if query is missing', async () => {
    const res = await request(app).get('/api/search');
    
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Query parameter is required');
  });

  it('should return 200 and mocked data when query is provided', async () => {
    const mockData = {
      clientes: [{ id: 1, nome: 'Test' }],
      ordens_servico: [],
      motores: []
    };

    // Inject mock implementation
    vi.spyOn(SearchUseCase.prototype, 'execute').mockResolvedValue(mockData);

    const res = await request(app).get('/api/search?query=Test');
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toEqual(mockData);
  });
});
