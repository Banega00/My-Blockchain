import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import { ApiRouter } from './routes/api.routes';

dotenv.config();

const app = express();

export default app;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client/dist')));

app.use('/api', ApiRouter)



app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});