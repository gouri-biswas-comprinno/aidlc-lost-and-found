import { Router } from 'express';
import { createReportController } from '../controllers/reportController.js';
import { createAuthenticateToken } from '../middleware/authenticateToken.js';

export function createReportRoutes(Report, { jwtSecret, blacklistModel } = {}) {
  const router = Router();
  const controller = createReportController(Report);
  const authenticateToken = createAuthenticateToken({ jwtSecret, blacklistModel });

  router.get('/', controller.list);
  router.post('/', authenticateToken, controller.create);
  router.get('/:id', controller.getOne);
  router.put('/:id', authenticateToken, controller.update);
  router.patch('/:id/resolve', authenticateToken, controller.resolve);
  router.delete('/:id', authenticateToken, controller.remove);

  return router;
}
