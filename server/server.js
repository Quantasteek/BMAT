import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js';

const app = express();
const port = 3000;

// Middleware

app.use(cors());    
app.use(express.json());    

await connectDB();

//Api Routes
app.get('/', (req, res) => {
    res.send('Server is live')
})

app.listen(port, ()=>{console.log(`Server is running on port ${port}`)})        