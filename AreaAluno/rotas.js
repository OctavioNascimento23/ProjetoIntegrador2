import express from 'express';
import { queryOracle } from '../db.js';

const router = express.Router();

// Rota de Login
router.post('/login', async (req, res) => {
  const { cpf } = req.body;
  const sql = 'SELECT * FROM users WHERE cpf = :cpf';
  const params = { cpf };

  try {
    const result = await queryOracle(sql, params);
    if (result.rows && result.rows.length > 0) {
      res.send("Login bem-sucedido!");
    } else {
      res.status(404).json({ error: "Usuário não encontrado" });
    }
  } catch (error) {
    console.error('Erro no login', error);
    res.status(500).json({ error: 'Erro ao consultar o banco de dados Oracle' });
  }
});

// Rota para Registrar um Novo Usuário
router.post('/register', async (req, res) => {
  const { nome, cpf, email, endereco } = req.body;
  const checkSql = 'SELECT * FROM users WHERE cpf = :cpf';
  const checkParams = { cpf };

  try {
    const checkResult = await queryOracle(checkSql, checkParams);
    if (checkResult.rows && checkResult.rows.length > 0) {
      res.status(409).send("Usuário já registrado.");
    } else {
      const insertSql = 'INSERT INTO users (nome, cpf, email, endereco) VALUES (:nome, :cpf, :email, :endereco)';
      const insertParams = { nome, cpf, email, endereco };
      await queryOracle(insertSql, insertParams);
      res.status(201).send("Usuário registrado com sucesso!");
    }
  } catch (error) {
    console.error('Erro ao registrar usuário', error);
    res.status(500).json({ error: 'Erro ao salvar no banco de dados Oracle' });
  }
});

export default router;
