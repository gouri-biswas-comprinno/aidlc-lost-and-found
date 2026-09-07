import cors from 'cors';
import express from 'express';
import { Report } from './models/report.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createReportRoutes } from './routes/reportRoutes.js';

export function createApp({ reportModel = Report } = {}) {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (request, response) => response.json({ status: 'ok' }));
  app.use('/api/reports', createReportRoutes(reportModel));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
