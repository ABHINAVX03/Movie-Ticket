import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { functions, inngest } from './inngest/index.js';
import { serve } from 'inngest/express'
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
dotenv.config();

const app = express();
const port = 3000;


// Connect to DB first
const startServer = async () => {
  try {
    await connectDB();
    //MiddleWare
    app.use(express.json());
    app.use(cors({
      origin: [
        'http://localhost:5173',
        'https://movie-ticket-phi-tan.vercel.app'
      ],
    }));
    app.use(clerkMiddleware())
    // API routing
    app.get('/', (req, res) => res.send('Server is Live!'));
    app.use('/api', publicRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/inngest', serve({ client: inngest, functions }))
    app.listen(port, () => {
      console.log(`🚀 Server listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
