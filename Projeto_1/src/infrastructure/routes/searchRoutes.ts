import { Router } from 'express';
import { SearchController } from '../adapters/controllers/SearchController';
import { authenticateUser } from '../../middlewares/authMiddleware';


const router = Router();
const searchController = new SearchController();

// GET /api/search?query=...
// We use authenticateUser to get the session token and respect RLS
router.get('/', authenticateUser, searchController.search);

export default router;
