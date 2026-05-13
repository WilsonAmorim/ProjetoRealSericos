import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ClienteController } from '../../../src/infrastructure/adapters/controllers/ClienteController';
import { supabase } from '../../../src/config/supabase';
import { AppError } from '../../../src/middlewares/errorHandler';

// Mock Supabase directly using vi.mock
vi.mock('../../../src/config/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('ClienteController', () => {
  let controller: ClienteController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new ClienteController();
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('createCliente', () => {
    it('should call next with AppError if missing fields', async () => {
      req.body = { documento: '123' }; // missing nome_razao_social
      
      await controller.createCliente(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const errorArg = (next as any).mock.calls[0][0];
      expect(errorArg.statusCode).toBe(400);
      expect(errorArg.message).toContain('required');
    });

    it('should create client and return 201', async () => {
      req.body = { documento: '123', nome_razao_social: 'Teste' };
      
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: 1, ...req.body }, error: null });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      });

      await controller.createCliente(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({ id: 1 })
      });
    });

    it('should handle unique constraint violation', async () => {
      req.body = { documento: '123', nome_razao_social: 'Teste' };
      
      (supabase.from as any).mockReturnValue({
        insert: () => ({
          select: () => ({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: '23505' } })
          })
        })
      });

      await controller.createCliente(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const errorArg = (next as any).mock.calls[0][0];
      expect(errorArg.statusCode).toBe(409);
    });
  });
});
