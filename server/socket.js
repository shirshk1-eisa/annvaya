import { Server } from 'socket.io';

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room based on user role (donor/ngo)
    socket.on('join-role', (role) => {
      socket.join(role);
      console.log(`   └─ Joined room: ${role}`);
    });

    // Join room for specific user (for targeted events)
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`   └─ Joined user room: user-${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
