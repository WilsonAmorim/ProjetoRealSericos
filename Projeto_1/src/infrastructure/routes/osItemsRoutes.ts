import { Router } from 'express';
import { OSItemsController } from '../adapters/controllers/OSItemsController';
import { authenticateUser } from '../../middlewares/authMiddleware';

const router = Router();
const controller = new OSItemsController();

// Todas as rotas de itens requerem autenticação
router.use(authenticateUser);

// Listar tipos de serviço (dropdown)
router.get('/tipos-servico', controller.getServiceTypes);

// Buscar produtos (peças)
router.get('/produtos/busca', controller.searchProducts);

// Listar itens de uma OS
router.get('/:id_os', controller.getItemsByOS);

// Adicionar item à OS
router.post('/', controller.addItem);


// Remover item da OS
router.delete('/:id_item', controller.removeItem);

export default router;
