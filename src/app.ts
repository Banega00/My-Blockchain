import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import { ApiRouter } from './routes/api.routes';
import cors from 'cors'
dotenv.config();

const app = express();

app.use(cors())
app.use(bodyParser.json());

app.use('/api', ApiRouter)

app.use(express.static(path.join(__dirname, 'client/dist')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

export default app;