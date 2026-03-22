import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import { initializeSocket } from './config/socket';
import assignmentRoutes from './routes/assignmentRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);

export const io = initializeSocket(httpServer);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/assignments', assignmentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-assignment', (assignmentId: string) => {
    socket.join(assignmentId);
    console.log(`Client ${socket.id} joined assignment ${assignmentId}`);
  });

  socket.on('leave-assignment', (assignmentId: string) => {
    socket.leave(assignmentId);
    console.log(`Client ${socket.id} left assignment ${assignmentId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
