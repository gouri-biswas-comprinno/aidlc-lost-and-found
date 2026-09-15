import { Router } from 'express';
import { createAuthController } from '../controllers/authController.js';
import { createAuthenticateToken } from '../middleware/authenticateToken.js';

export function createAuthRoutes(User, { jwtSecret, jwtExpiresIn, blacklistModel } = {}) {
  const router = Router();
  const controller = createAuthController(User, { jwtSecret, jwtExpiresIn, blacklistModel });
  const authenticateToken = createAuthenticateToken({ jwtSecret, blacklistModel });

  router.post('/signup', controller.signup);
  router.post('/login', controller.login);
  router.post('/logout', authenticateToken, controller.logout);

  return router;
}