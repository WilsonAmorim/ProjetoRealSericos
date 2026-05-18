import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

import searchRoutes from './infrastructure/routes/searchRoutes';
import osRoutes from './infrastructure/routes/osRoutes';
import clienteRoutes from './infrastructure/routes/clienteRoutes';
import motorRoutes from './infrastructure/routes/motorRoutes';
import osItemsRoutes from './infrastructure/routes/osItemsRoutes';
import rebobinamentoRoutes from './infrastructure/routes/rebobinamentoRoutes';

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'RealServiços API is running' });
});

app.use('/api/search', searchRoutes);
app.use('/api/os', osRoutes);
app.use('/api/os-itens', osItemsRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/motores', motorRoutes);
app.use('/api/rebobinamentos', rebobinamentoRoutes);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
