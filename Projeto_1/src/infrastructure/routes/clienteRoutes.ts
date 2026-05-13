import { Router } from 'express';
import { ClienteController } from '../adapters/controllers/ClienteController';
import { authenticateUser, requireRoles, Roles } from '../../middlewares/authMiddleware';

const router = Router();
const clienteController = new ClienteController();

// GET /api/clientes - Read all clients
router.get('/', 
  authenticateUser, 
  requireRoles([Roles.ADMIN, Roles.RECEPCO, Roles.MECANICO, Roles.ELETRICISTA]), 
  clienteController.getClientes
);

// POST /api/clientes - Create a new client
router.post('/', 
  authenticateUser, 
  requireRoles([Roles.ADMIN, Roles.RECEPCO]), 
  clienteController.createCliente
);

// PUT /api/clientes/:id - Update an existing client
router.put('/:id',
  authenticateUser,
  requireRoles([Roles.ADMIN, Roles.RECEPCO]),
  clienteController.updateCliente
);

// DELETE /api/clientes/:id - Delete a client
// Admin and Recepcao can delete clients
router.delete('/:id',
  authenticateUser,
  requireRoles([Roles.ADMIN, Roles.RECEPCO]),
  clienteController.deleteCliente
);

export default router;
