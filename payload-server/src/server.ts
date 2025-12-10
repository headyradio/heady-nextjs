import path from 'path';
import express from 'express';
import payload from 'payload';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

const corsOrigins = (process.env.PAYLOAD_CORS ?? 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);

const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'change-me',
    express: app,
    configPath: path.resolve(__dirname, '../payload.config.ts'),
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  app.listen(port, () => {
    payload.logger.info(`Payload server running at http://localhost:${port}`);
  });
};

start();



