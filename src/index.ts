import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import errorHandler from './handlers/error';
import connectDB from './config/db';
import authRouter from './routes/Auth';
import { protect } from './middlewares/auth';
// Initialize environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const startServer = async () => {
  try {

    await connectDB();

    app.use(cors());        
    app.use(express.json());

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

    app.use('/api/auth', authRouter);
   
    app.use(errorHandler);

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error('💀 Failed to connect to the database:', error);
    process.exit(1); 
  }
};

startServer();