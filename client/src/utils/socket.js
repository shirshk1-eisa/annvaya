import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(user) {
  const s = getSocket();

  if (!s.connected) {
    s.connect();

    s.on('connect', () => {
      console.log('🔌 Socket connected:', s.id);

      // Join role-based room
      if (user?.role) {
        s.emit('join-role', user.role);
      }

      // Join user-specific room
      if (user?._id) {
        s.emit('join-user', user._id);
      }
    });
  }

  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
    console.log('🔌 Socket disconnected');
  }
}
