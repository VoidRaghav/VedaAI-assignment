import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = (): void => {
  const socketInstance = getSocket();
  if (!socketInstance.connected) {
    socketInstance.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const joinAssignment = (assignmentId: string): void => {
  const socketInstance = getSocket();
  socketInstance.emit('join-assignment', assignmentId);
};

export const leaveAssignment = (assignmentId: string): void => {
  const socketInstance = getSocket();
  socketInstance.emit('leave-assignment', assignmentId);
};
