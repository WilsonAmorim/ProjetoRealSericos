import { Router } from 'express';
import { RebobinamentoController } from '../adapters/controllers/RebobinamentoController';
import { authenticateUser, requireRoles, Roles } from '../../middlewares/authMiddleware';

const router = Router();
const controller = new RebobinamentoController();

// Todas as rotas de rebobinamentos requerem autenticação
router.use(authenticateUser);

// Listar todos os rebobinamentos
router.get('/',
  requireRoles([Roles.ADMIN, Roles.RECEPCO, Roles.MECANICO, Roles.ELETRICISTA]),
  controller.getRebobinamentos
);

// Cadastrar novo rebobinamento
router.post('/',
  requireRoles([Roles.ADMIN, Roles.RECEPCO, Roles.MECANICO, Roles.ELETRICISTA]),
  controller.createRebobinamento
);

// Atualizar rebobinamento existente
router.put('/:id',
  requireRoles([Roles.ADMIN, Roles.RECEPCO, Roles.MECANICO, Roles.ELETRICISTA]),
  controller.updateRebobinamento
);

// Excluir rebobinamento existente
router.delete('/:id',
  requireRoles([Roles.ADMIN, Roles.RECEPCO, Roles.MECANICO, Roles.ELETRICISTA]),
  controller.deleteRebobinamento
);

export default router;
