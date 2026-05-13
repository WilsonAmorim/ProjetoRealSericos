import { Request, Response, NextFunction } from 'express';
import { supabase as defaultSupabase } from '../../../config/supabase';
import { AppError } from '../../../middlewares/errorHandler';

export class ClienteController {

  public createCliente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clienteData = req.body;
      const db = req.supabase || defaultSupabase;

      if (!clienteData.documento || !clienteData.nome_razao_social) {
        return next(new AppError('Documento e Nome/Razão Social são obrigatórios', 400));
      }

      const { data, error } = await db
        .from('cliente')
        .insert([clienteData])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return next(new AppError('Cliente com este documento já existe', 409));
        }
        return next(new AppError(error.message, 500));
      }

      res.status(201).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  public getClientes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = req.supabase || defaultSupabase;
      const { data, error } = await db
        .from('cliente')
        .select('*');

      if (error) {
        return next(new AppError(error.message, 500));
      }

      res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  public updateCliente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const clienteData = req.body;
      const db = req.supabase || defaultSupabase;

      if (!id) {
        return next(new AppError('ID do cliente é obrigatório', 400));
      }

      // Remove fields that shouldn't be updated directly
      const { id_cliente, data_criacao, data_atualizacao, ...updateData } = clienteData;

      const { data, error } = await db
        .from('cliente')
        .update(updateData)
        .eq('id_cliente', id)
        .select();

      if (error) {
        return next(new AppError(error.message, 500));
      }

      res.status(200).json({
        status: 'success',
        data: data?.[0] ?? null
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteCliente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const db = req.supabase || defaultSupabase;

      if (!id) {
        return next(new AppError('ID do cliente é obrigatório', 400));
      }

      const { error } = await db
        .from('cliente')
        .delete()
        .eq('id_cliente', id);

      if (error) {
        return next(new AppError(error.message, 500));
      }

      res.status(200).json({
        status: 'success',
        message: 'Cliente excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  };
}
