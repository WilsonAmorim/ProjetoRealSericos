import { Router } from 'express';
import { MotorController } from '../adapters/controllers/MotorController';
import { authenticateUser, requireRoles, Roles } from '../../middlewares/authMiddleware';

const router = Router();
const motorController = new MotorController();

// GET /api/motores - Lista todos ou filtra por id_cliente
router.get('/',
  authenticateUser,
  // Removi temporariamente o requireRoles para teste, ou verifique a ortografia de RECEPCO
  motorController.getMotores
);

// POST /api/motores - Criar
router.post('/',
  authenticateUser,
  motorController.createMotor
);

// PUT /api/motores/:id - Atualizar (Faltava esta rota!)
router.put('/:id',
  authenticateUser,
  motorController.updateMotor
);


// DELETE /api/motores/:id - Deletar (Faltava esta rota!)
router.delete('/:id',
  authenticateUser,
  motorController.deleteMotor
);

export default router;