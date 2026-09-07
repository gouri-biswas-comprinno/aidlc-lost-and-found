import { Router } from 'express';
import { createReportController } from '../controllers/reportController.js';

export function createReportRoutes(Report) {
  const router = Router();
  const controller = createReportController(Report);

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.getOne);
  router.put('/:id', controller.update);
  router.patch('/:id/resolve', controller.resolve);
  router.delete('/:id', controller.remove);

  return router;
}
