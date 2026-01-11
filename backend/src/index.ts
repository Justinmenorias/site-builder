import express, { type Request, type Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth.js';

const app = express();
const PORT = process.env.PORT;
const corsOption = {
  origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOption));

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.get('/', (req: Request, res: Response) => {
  res.send({ message: 'hey' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
