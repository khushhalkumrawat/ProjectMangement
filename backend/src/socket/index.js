/**
 * Socket.io Event Handlers
 * Manages real-time collaboration features
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Store active users per board
const activeBoardUsers = new Map();

const initializeSocketHandlers = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.id})`);

    // Join board room
    socket.on('join:board', (boardId) => {
      socket.join(`board:${boardId}`);
      
      // Track active users
      if (!activeBoardUsers.has(boardId)) {
        activeBoardUsers.set(boardId, new Set());
      }
      activeBoardUsers.get(boardId).add({
        userId: socket.user._id.toString(),
        name: socket.user.name,
        avatar: socket.user.avatar,
        socketId: socket.id
      });

      // Notify others in the board
      socket.to(`board:${boardId}`).emit('user:joined', {
        userId: socket.user._id,
        name: socket.user.name,
        avatar: socket.user.avatar
      });

      // Send current active users to the joining user
      const activeUsers = Array.from(activeBoardUsers.get(boardId) || []);
      socket.emit('board:activeUsers', activeUsers);

      console.log(`User ${socket.user.name} joined board ${boardId}`);
    });

    // Leave board room
    socket.on('leave:board', (boardId) => {
      socket.leave(`board:${boardId}`);
      
      // Remove from active users
      if (activeBoardUsers.has(boardId)) {
        const users = activeBoardUsers.get(boardId);
        const updatedUsers = Array.from(users).filter(
          u => u.socketId !== socket.id
        );
        activeBoardUsers.set(boardId, new Set(updatedUsers));
      }

      // Notify others
      socket.to(`board:${boardId}`).emit('user:left', {
        userId: socket.user._id
      });

      console.log(`User ${socket.user.name} left board ${boardId}`);
    });

    // Card moved
    socket.on('card:moved', (data) => {
      const { boardId, cardId, sourceColumnId, targetColumnId, newPosition } = data;
      
      socket.to(`board:${boardId}`).emit('card:moved', {
        cardId,
        sourceColumnId,
        targetColumnId,
        newPosition,
        movedBy: {
          userId: socket.user._id,
          name: socket.user.name
        }
      });
    });

    // Card created
    socket.on('card:created', (data) => {
      const { boardId, card } = data;
      
      socket.to(`board:${boardId}`).emit('card:created', {
        card,
        createdBy: {
          userId: socket.user._id,
          name: socket.user.name
        }
      });
    });

    // Card updated
    socket.on('card:updated', (data) => {
      const { boardId, cardId, updates } = data;
      
      socket.to(`board:${boardId}`).emit('card:updated', {
        cardId,
        updates,
        updatedBy: {
          userId: socket.user._id,
          name: socket.user.name
        }
      });
    });

    // Card deleted
    socket.on('card:deleted', (data) => {
      const { boardId, cardId } = data;
      
      socket.to(`board:${boardId}`).emit('card:deleted', {
        cardId,
        deletedBy: {
          userId: socket.user._id,
          name: socket.user.name
        }
      });
    });

    // Comment added
    socket.on('comment:added', (data) => {
      const { boardId, cardId, comment } = data;
      
      socket.to(`board:${boardId}`).emit('comment:added', {
        cardId,
        comment
      });
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      const { boardId, cardId } = data;
      
      socket.to(`board:${boardId}`).emit('typing:start', {
        cardId,
        user: {
          userId: socket.user._id,
          name: socket.user.name
        }
      });
    });

    socket.on('typing:stop', (data) => {
      const { boardId, cardId } = data;
      
      socket.to(`board:${boardId}`).emit('typing:stop', {
        cardId,
        userId: socket.user._id
      });
    });

    // Column created
    socket.on('column:created', (data) => {
      const { boardId, column } = data;
      
      socket.to(`board:${boardId}`).emit('column:created', {
        column
      });
    });

    // Column updated
    socket.on('column:updated', (data) => {
      const { boardId, columnId, updates } = data;
      
      socket.to(`board:${boardId}`).emit('column:updated', {
        columnId,
        updates
      });
    });

    // Column deleted
    socket.on('column:deleted', (data) => {
      const { boardId, columnId } = data;
      
      socket.to(`board:${boardId}`).emit('column:deleted', {
        columnId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name} (${socket.id})`);
      
      // Remove from all active board users
      activeBoardUsers.forEach((users, boardId) => {
        const updatedUsers = Array.from(users).filter(
          u => u.socketId !== socket.id
        );
        
        if (updatedUsers.length > 0) {
          activeBoardUsers.set(boardId, new Set(updatedUsers));
        } else {
          activeBoardUsers.delete(boardId);
        }
        
        // Notify others in the board
        socket.to(`board:${boardId}`).emit('user:left', {
          userId: socket.user._id
        });
      });
    });
  });

  console.log('✅ Socket.io handlers initialized');
};

module.exports = initializeSocketHandlers;
