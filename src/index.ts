import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './handlers/error';
import connectDB from './config/db'; // Using the robust connectDB
import authRouter from './routes/Auth';
import userRouter from './routes/User';

dotenv.config();

const app: Express = express();

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed on request:', error);
    // Stop the request if the database connection fails
    res.status(500).json({
      message: 'Internal Server Error: Could not connect to the database.',
    });
  }
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body and cookie parsers
app.use(express.json());
app.use(cookieParser());


// --- API Routes ---

// Health check and root routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Fixera API Server is running',
    status: 'Up',
    version: '1.0.0',
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: "UP" });
});

// Your application's main routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);


// --- Error Handler ---
// This should be the last piece of middleware
app.use(errorHandler);

// Export the configured app for Vercel
export default app;
