import { Router } from 'express';
import { createAuthController } from '../controllers/authController.js';

export function createAuthRoutes(User, jwtOptions) {
  const router = Router();
  const controller = createAuthController(User, jwtOptions);

  router.post('/signup', controller.signup);
  router.post('/login', controller.login);

  return router;
}