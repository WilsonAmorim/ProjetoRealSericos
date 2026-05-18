import { Router } from 'express';
import { OSItemsController } from '../adapters/controllers/OSItemsController';
import { authenticateUser } from '../../middlewares/authMiddleware';

const router = Router();
const controller = new OSItemsController();

// Todas as rotas de itens requerem autenticação
router.use(authenticateUser);

// Listar tipos de serviço (dropdown)
router.get('/tipos-servico', controller.getServiceTypes);

// Buscar peças
router.get('/pecas/busca', controller.searchPecas);

// Listar todas as peças (ComboBox)
router.get('/pecas', controller.getAllPecas);

// Listar itens de uma OS
router.get('/:id_os', controller.getItemsByOS);

// Adicionar item à OS
router.post('/', controller.addItem);


// Remover item da OS (usar query param ?type=servico ou ?type=peca)
router.delete('/:id_item', controller.removeItem);

// Atualizar item da OS (usar query param ?type=servico ou ?type=peca)
router.put('/:id_item', controller.updateItem);

export default router;
