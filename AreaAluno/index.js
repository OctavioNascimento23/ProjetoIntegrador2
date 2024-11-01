import express from 'express';
import path from 'path';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware para permitir CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});

// Configura rotas de autenticação
app.use('/api/auth', authRoutes);

// Inicializa o servidor
app.listen(5000, () => {
  console.log('Servidor rodando na porta 3000');
});
