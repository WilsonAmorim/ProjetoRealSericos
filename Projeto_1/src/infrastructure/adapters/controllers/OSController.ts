import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../../config/supabase';
import { AppError } from '../../../middlewares/errorHandler';

export class OSController {

  // 1. NOVO MÉTODO: Criar O.S. Real no Banco
  public createOS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Como usamos FormData (Multer), os dados vêm como strings
      const { id_motor, data_entrada, observacoes_gerais, id_causa_queima, id_andamento } = req.body;

      // Captura as fotos caso tenham sido enviadas
      const files = req.files as Express.Multer.File[];
      const fotosPaths = files ? files.map(file => file.path) : [];

      if (!id_motor) {
        return next(new AppError('O ID do motor é obrigatório para abrir uma OS', 400));
      }

      // Prepara o objeto convertendo os tipos adequadamente
      const osDataToInsert = {
        id_motor: Number(id_motor),
        data_entrada: data_entrada ? new Date(data_entrada) : new Date(),
        id_andamento: id_andamento ? Number(id_andamento) : 9, // Padrão: 9 (Aguardando Orçamento)
        observacoes_gerais: observacoes_gerais || null,
        id_causa_queima: id_causa_queima ? Number(id_causa_queima) : null,
      };

      // Realiza o INSERT no Supabase
      const { data, error } = await supabase
        .from('ordens_servico')
        .insert([osDataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Erro no INSERT da OS no Supabase:', error);
        return next(new AppError(error.message, 500));
      }

      res.status(201).json({
        status: 'success',
        message: 'OS criada com sucesso!',
        data: {
          ...data,
          // Retornamos os caminhos das fotos salvos localmente
          fotos_salvas_localmente: fotosPaths
        }
      });
    } catch (error) {
      console.error('Erro interno no createOS:', error);
      next(error);
    }
  };

  // 2. MÉTODO EXISTENTE: Relatório Técnico
  public getTechnicalReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return next(new AppError('Invalid OS ID', 400));
      }

      const { data: osData, error: osError } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          motores (
            *,
            cliente (*)
          ),
          os_itens_servico (*)
        `)
        .eq('id_os', Number(id))
        .single();

      if (osError || !osData) {
        return next(new AppError('Service Order not found', 404));
      }

      const relatorio = {
        os: {
          id: osData.id_os,
          data_entrada: osData.data_entrada,
          observacoes: osData.observacoes_gerais,
          status: osData.id_andamento
        },
        cliente: osData.motores?.cliente,
        motor: {
          num_serie: osData.motores?.num_serie,
          fabricante: osData.motores?.fabricante,
          potencia: osData.motores?.potencia_cv_kw,
          rpm: osData.motores?.rpm,
          rolamento_la: osData.motores?.rolamento_la,
          rolamento_loa: osData.motores?.rolamento_loa
        },
        itens_usados: osData.os_itens_servico || []
      };

      res.status(200).json({
        status: 'success',
        data: relatorio
      });

    } catch (error) {
      next(error);
    }
  };

  public getActiveOS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
        id_os,
        data_entrada,
        id_andamento,
        motores (
          num_serie,
          especificacao,
          cliente (nome_razao_social)
        ),
        andamento_servico!ordens_servico_id_andamento_fkey (
          descricao_andamento
        )
      `)
        .not('id_andamento', 'in', '(6,7,8)')
        .order('data_entrada', { ascending: false });

      if (error) return next(new AppError(error.message, 500));

      const formattedData = data.map((os: any) => ({
        id_os: os.id_os,
        data_abertura: os.data_entrada,

        // Pegamos a descrição usando a exclamação que força a FK correta
        andamento: os.andamento_servico?.descricao_andamento || `Status ${os.descricao_andamento}`,

        cliente: {
          razao_social: os.motores?.cliente?.nome_razao_social || 'N/D'
        },
        motor: {
          num_serie: os.motores?.num_serie || '-',
          especificacao: os.motores?.especificacao || ''
        }
      }));

      res.status(200).json({ status: 'success', data: formattedData });
    } catch (error) {
      next(error);
    }
  };

  public getOSById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
        *,
        motores (
          *,
          cliente (
            *
          )
        ),
        andamento_servico!ordens_servico_id_andamento_fkey (
          descricao_andamento
        )
      `)
        .eq('id_os', Number(id))
        .single();

      if (error || !data) {
        return next(new AppError('Ordem de Serviço não encontrada', 404));
      }

      // Consulta robusta e segura para obter a causa da queima
      let causaTexto = 'Não identificada / Não informada';
      if (data.id_causa_queima) {
        try {
          const { data: causaData } = await supabase
            .from('causas_queima')
            .select('descricao_causa')
            .eq('id_causa_queima', Number(data.id_causa_queima))
            .single();
          if (causaData?.descricao_causa) {
            causaTexto = causaData.descricao_causa;
          }
        } catch (e) {
          console.error('Erro ao buscar causa da queima:', e);
        }
      }

      const formattedData = {
        ...data,
        status_texto: data.andamento_servico?.descricao_andamento || `Status ${data.id_andamento}`,
        causa_texto: causaTexto,
        cliente: data.motores?.cliente ? {
          ...data.motores.cliente,
          razao_social: data.motores.cliente.nome_razao_social || 'N/D'
        } : { razao_social: 'N/D' },
        motor: data.motores ? {
          ...data.motores
        } : null
      };

      res.status(200).json({ status: 'success', data: formattedData });
    } catch (error) {
      next(error);
    }
  };

  public getAndamentos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabase
        .from('andamento_servico')
        .select('id_andamento, descricao_andamento')
        .order('id_andamento', { ascending: true });

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };


  public getCauses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabase
        .from('causas_queima')
        .select('*')
        .order('descricao_causa', { ascending: true });

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  // Atualizar andamento e diagnóstico técnico
  public updateOS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { id_andamento, id_causa_queima, observacoes_tecnicas } = req.body;

      const updateData = {
        id_andamento: id_andamento ? Number(id_andamento) : undefined,
        id_causa_queima: id_causa_queima !== undefined ? (id_causa_queima ? Number(id_causa_queima) : null) : undefined,
        observacoes_gerais: observacoes_tecnicas || undefined,
      };

      const { data, error } = await supabase
        .from('ordens_servico')
        .update(updateData)
        .eq('id_os', Number(id))
        .select();

      if (error) {
        return next(new AppError(error.message, 500));
      }

      if (!data || data.length === 0) {
        return next(new AppError('Nenhuma Ordem de Serviço foi encontrada ou atualizada.', 404));
      }

      res.status(200).json({
        status: 'success',
        message: 'OS atualizada com sucesso!',
        data: data[0]
      });
    } catch (error) {
      next(error);
    }
  };
}