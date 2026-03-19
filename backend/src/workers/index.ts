import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/database';
import { connectRedis } from '../config/redis';
import { questionWorker } from './questionWorker';
import { pdfWorker } from './pdfWorker';

const startWorkers = async () => {
  try {
    await connectDB();
    await connectRedis();

    console.log('Workers started successfully');
    console.log('Question Worker: Active');
    console.log('PDF Worker: Active');
  } catch (error) {
    console.error('Failed to start workers:', error);
    process.exit(1);
  }
};

startWorkers();

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing workers...');
  await questionWorker.close();
  await pdfWorker.close();
  process.exit(0);
});
