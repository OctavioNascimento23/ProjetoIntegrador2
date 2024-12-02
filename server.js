const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Rotas
const userRoutes = require('./routes/users');
const acessosRoutes = require('./routes/acessos');
const relatoriosRoutes = require('./routes/relatorios');

app.use(userRoutes);
app.use(acessosRoutes);
app.use(relatoriosRoutes);

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});