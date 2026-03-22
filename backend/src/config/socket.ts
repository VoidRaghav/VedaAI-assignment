import { Server } from 'socket.io';
import { createServer } from 'http';

let io: Server;

export const initializeSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
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

  return io;
};

export const getIO = () => {
  if (!io) {
    const httpServer = createServer();
    return initializeSocket(httpServer);
  }
  return io;
};
