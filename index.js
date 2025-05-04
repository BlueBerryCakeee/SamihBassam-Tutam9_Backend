import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todoRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// MongoDB Connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database instance');
    return cachedDb;
  }
  
  try {
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    };

    // Connect to database
    const client = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('Connected to MongoDB Atlas');
    
    cachedDb = client;
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

// Connect to database if not in serverless environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB', err);
    });
} else {
  // In production (Vercel), we connect for each request
  app.use(async (req, res, next) => {
    try {
      await connectToDatabase();
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
  });
}

export default app;
