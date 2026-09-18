import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    socket = null;

    connect() {
        if (this.socket) return;

        const token = localStorage.getItem('token');
        
        this.socket = io(SOCKET_URL, {
            auth: {
                token
            },
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinBoard(boardId) {
        if (this.socket) {
            this.socket.emit('join:board', boardId);
        }
    }

    leaveBoard(boardId) {
        if (this.socket) {
            this.socket.emit('leave:board', boardId);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }
}

export default new SocketService();
