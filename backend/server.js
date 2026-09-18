require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import configurations
const connectDB = require('./src/config/database');
const { initializeGemini } = require('./src/config/gemini');
const { initializeCloudinary } = require('./src/config/cloudinary');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const workspaceRoutes = require('./src/routes/workspace.routes');
const boardRoutes = require('./src/routes/board.routes');
const columnRoutes = require('./src/routes/column.routes');
const cardRoutes = require('./src/routes/card.routes');
const commentRoutes = require('./src/routes/comment.routes');
const automationRoutes = require('./src/routes/automation.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const aiRoutes = require('./src/routes/ai.routes');

// Import socket handlers
const initializeSocketHandlers = require('./src/socket');

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Connect to Database
connectDB();

// Initialize AI and Cloud Services
initializeGemini();
initializeCloudinary();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Make io accessible to routes
app.set('io', io);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/automations', automationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);


// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize Socket.io handlers
initializeSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`
    🚀 Advanced Kanban Server Running                                                                         
     📡 Port: ${PORT}                                    
     🌍 Environment: ${process.env.NODE_ENV || 'development'} 
     📅 Started: ${new Date().toLocaleString()}
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

module.exports = { app, httpServer, io };
