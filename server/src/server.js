import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { createApp } from './app.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const port = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is required to start the server.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully');

  const app = createApp();

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error('Unable to connect to MongoDB Atlas.', error);
  process.exit(1);
}