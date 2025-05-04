import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todoRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route handler
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task By Samih API is running',
    endpoints: {
      todos: '/api/todos',
      auth: '/api/auth'
    } 
  });
});

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);

// Configure mongoose to handle connection issues
mongoose.connect(process.env.MONGODB_URI, {
  // These options help with connection issues
  serverSelectionTimeoutMS: 5000,
  // Auto reconnect if connection is lost
  autoReconnect: true,
  // Use the new URL parser
  useNewUrlParser: true,
  // Use the unified topology
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('MongoDB connection error:', error.message);
  // Don't stop the server if DB connection fails
  console.log('API will continue to run without database functionality');
});

// Handle server startup based on environment
// Start server for local development
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for serverless
export default app;
