const express = require('express');
const router = express.Router();
const connection = require('../db/connection');

// Rota para registrar a entrada na academia
router.post('/entrada', (req, res) => {
  const { cpf } = req.body;

  if (!cpf) {
    return res.status(400).json({ message: 'CPF é necessário' });
  }

  // Verificar se o aluno existe
  const queryCheck = 'SELECT * FROM users WHERE cpf = ?';
  connection.query(queryCheck, [cpf], (err, result) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).json({ message: 'Erro ao verificar usuário' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const userId = result[0].id; // ID do aluno
    const entryTime = new Date(); // Hora atual

    // Inserir o registro de entrada na tabela 'acessos'
    const queryInsertEntry = `
      INSERT INTO acessos (user_id, entry_time)
      VALUES (?, ?);
    `;

    connection.query(queryInsertEntry, [userId, entryTime], (err, result) => {
      if (err) {
        console.error('Erro ao registrar entrada:', err);
        return res.status(500).json({ message: 'Erro ao registrar entrada' });
      }

      res.status(200).json({
        success: true,
        message: 'Entrada registrada com sucesso',
        entryTime: entryTime,
      });
    });
  });
});

// Rota para registrar a saída do aluno
router.post('/saida', (req, res) => {
  const { cpf } = req.body;

  if (!cpf) {
    return res.status(400).json({ message: 'CPF é necessário' });
  }

  // Verificar se o aluno existe
  const queryCheck = 'SELECT * FROM users WHERE cpf = ?';
  connection.query(queryCheck, [cpf], (err, result) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).json({ message: 'Erro ao verificar usuário' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const userId = result[0].id; // ID do aluno
    const exitTime = new Date(); // Hora atual

    // Verificar se há um registro de entrada pendente (sem saída registrada)
    const queryCheckEntry = 'SELECT * FROM acessos WHERE user_id = ? AND exit_time IS NULL ORDER BY entry_time DESC LIMIT 1';
    connection.query(queryCheckEntry, [userId], (err, entryResult) => {
      if (err) {
        console.error('Erro ao verificar entrada:', err);
        return res.status(500).json({ message: 'Erro ao verificar entrada' });
      }

      if (entryResult.length === 0) {
        return res.status(400).json({ message: 'Não há entrada registrada para esse CPF' });
      }

      const accessId = entryResult[0].id; // ID do registro de acesso

      // Atualizar o registro de acesso com a hora de saída
      const queryUpdate = 'UPDATE acessos SET exit_time = ? WHERE id = ? AND exit_time IS NULL';
      connection.query(queryUpdate, [exitTime, accessId], (err, result) => {
        if (err) {
          console.error('Erro ao registrar saída:', err);
          return res.status(500).json({ message: 'Erro ao registrar saída' });
        }

        // Calcular o total de horas semanais de treinamento
        const queryTotalHours = `
          SELECT SUM(TIMESTAMPDIFF(HOUR, entry_time, exit_time)) AS total_hours
          FROM acessos
          WHERE user_id = ? AND entry_time >= CURDATE() - INTERVAL 7 DAY
        `;
        connection.query(queryTotalHours, [userId], (err, totalResult) => {
          if (err) {
            console.error('Erro ao calcular total de horas:', err);
            return res.status(500).json({ message: 'Erro ao calcular total de horas' });
          }

          const totalHours = totalResult[0].total_hours || 0;

          // Classificação do aluno com base nas horas semanais
          let classification = 'Iniciante';
          if (totalHours >= 6 && totalHours <= 10) classification = 'Intermediário';
          else if (totalHours >= 11 && totalHours <= 20) classification = 'Avançado';
          else if (totalHours > 20) classification = 'Extremamente avançado';

          res.status(200).json({
            success: true,
            message: 'Saída registrada com sucesso',
            totalHours,
            classification,
          });
        });
      });
    });
  });
});

module.exports = router;