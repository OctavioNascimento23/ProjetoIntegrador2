const express = require('express');
const router = express.Router();
const connection = require('../db/connection');

// Rota para criar um novo usuário
router.post('/usuarios', (req, res) => {
  const { nome, cpf, email } = req.body;

  // Validar CPF (deve ter exatamente 11 dígitos)
  if (!cpf || cpf.length !== 11 || !/^\d+$/.test(cpf)) {
    return res.status(400).json({ message: 'CPF inválido. Deve ter exatamente 11 dígitos.' });
  }

  // Validar e-mail
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'E-mail inválido.' });
  }

  // Inserir o novo usuário
  const queryInsert = `
    INSERT INTO users (name, cpf, email, role)
    VALUES (?, ?, ?, 'Aluno');
  `;

  connection.query(queryInsert, [nome, cpf, email], (err, result) => {
    if (err) {
      // Verifica erro de duplicidade (por exemplo, CPF já cadastrado)
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'CPF já cadastrado.' });
      }

      console.error('Erro ao registrar usuário:', err);
      return res.status(500).json({ message: 'Erro ao registrar usuário' });
    }

    res.status(200).json({ message: 'Usuário registrado com sucesso' });
  });
});

// Rota para login (apenas CPF)
router.post('/login', (req, res) => {
  const { cpf } = req.body;

  if (!cpf) {
    return res.status(400).json({ message: 'CPF é necessário' });
  }

  const queryCheck = `
    SELECT * FROM users WHERE cpf = ?;
  `;

  connection.query(queryCheck, [cpf], (err, result) => {
    if (err) {
      console.error('Erro ao fazer login:', err);
      return res.status(500).json({ message: 'Erro ao fazer login' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const user = result[0];
    if (user.role === 'Gerente') {
      res.status(200).json({ message: 'Login bem-sucedido', redirect: 'gerente.html' });
    } else {
      res.status(200).json({ message: 'Login bem-sucedido', redirect: 'relatorio.html' });
    }
  });
});

module.exports = router;