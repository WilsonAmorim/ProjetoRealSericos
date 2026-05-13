import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { AppError } from '../../middlewares/errorHandler';
import { OSController } from '../adapters/controllers/OSController';
// IMPORTANTE: Importar os middlewares de proteção
import { authenticateUser, requireRoles, Roles } from '../../middlewares/authMiddleware';

const router = Router();
const osController = new OSController();

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new AppError('Apenas imagens são permitidas.', 400) as any, false);
  }
});

// --- ROTAS PROTEGIDAS ---

// Listar OSs para o Dashboard (Qualquer perfil autenticado pode ver)
router.get('/ativas', authenticateUser, osController.getActiveOS);

// Listar todos os status de andamento possíveis
router.get('/andamentos', authenticateUser, osController.getAndamentos);

// Listar todas as causas de queima cadastradas
router.get('/causas', authenticateUser, osController.getCauses);

// Criar Nova O.S (Admin e Recepção apenas)
router.post('/',
  authenticateUser,
  requireRoles([Roles.ADMIN, Roles.RECEPCO]),
  upload.array('fotos_queima', 3),
  osController.createOS
);


// Adicione estas duas linhas no seu arquivo osRoutes.ts:

// Para BUSCAR os dados da OS e preencher o formulário (Resolve o 404)
router.get('/:id', authenticateUser, osController.getOSById);

// Para SALVAR as alterações de causa da queima e andamento
router.put('/:id', authenticateUser, osController.updateOS);

// Gerar Relatório Técnico
router.get('/:id/relatorio', authenticateUser, osController.getTechnicalReport);

export default router;