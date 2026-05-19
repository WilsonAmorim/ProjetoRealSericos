import { Router } from 'express';
import { FaturamentoController } from '../adapters/controllers/FaturamentoController';
import { authenticateUser, requireRoles, Roles } from '../../middlewares/authMiddleware';

const router = Router();
const controller = new FaturamentoController();

// Todas as rotas de faturamento requerem autenticação
router.use(authenticateUser);

// Listar OS's elegíveis para faturamento
router.get('/os-elegiveis',
  requireRoles([Roles.ADMIN]),
  controller.getEligibleOS
);

// Buscar valor total de OS's
router.get('/os-total',
  requireRoles([Roles.ADMIN]),
  controller.getOSTotal
);

// Listar todas as faturas
router.get('/',
  requireRoles([Roles.ADMIN]),
  controller.getFaturas
);

// Relatório mensal
router.get('/relatorio',
  requireRoles([Roles.ADMIN]),
  controller.getRelatorio
);

// Criar fatura
router.post('/',
  requireRoles([Roles.ADMIN]),
  controller.createFaturamento
);

// Marcar fatura como paga
router.put('/:id/pagar',
  requireRoles([Roles.ADMIN]),
  controller.markAsPaid
);

// Cancelar fatura
router.delete('/:id',
  requireRoles([Roles.ADMIN]),
  controller.cancelFatura
);

export default router;
