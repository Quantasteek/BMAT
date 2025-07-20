import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';
import showRouter from './routes/showRoutes.js';


const app = express();
const port = 9000;

// Middleware

app.use(cors());    
app.use(express.json());    
app.use(clerkMiddleware());


await connectDB();

//Api Routes
app.get('/', (req, res) => {
    res.send('Server is live')
})

app.use('/api/inngest', serve({client: inngest, functions}))     
app.use('/api/show', showRouter) 

app.listen(port, ()=>{console.log(`Server is running on port ${port}`)})        