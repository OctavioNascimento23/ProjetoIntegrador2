const express = require('express');
const router = express.Router();
const connection = require('../db/connection');

// Rota para obter o relatório de horas treinadas e classificação
router.get('/relatorio', (req, res) => {
  const { cpf } = req.query;

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
        totalHours,
        classification,
      });
    });
  });
});

// Rota para obter o relatório de todos os alunos
router.get('/relatorio-geral', (req, res) => {
  const { minHoras, maxHoras } = req.query;

  // Construir a query com filtros opcionais
  let query = `
    SELECT u.name, 
           SUM(TIMESTAMPDIFF(HOUR, a.entry_time, a.exit_time)) AS total_hours
    FROM users u
    JOIN acessos a ON u.id = a.user_id
    WHERE a.exit_time IS NOT NULL
  `;

  const queryParams = [];

  if (minHoras) {
    query += ' AND TIMESTAMPDIFF(HOUR, a.entry_time, a.exit_time) >= ?';
    queryParams.push(minHoras);
  }

  if (maxHoras) {
    query += ' AND TIMESTAMPDIFF(HOUR, a.entry_time, a.exit_time) <= ?';
    queryParams.push(maxHoras);
  }

  query += ' GROUP BY u.name ORDER BY total_hours DESC';

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Erro ao obter relatório geral:', err);
      return res.status(500).json({ message: 'Erro ao obter relatório geral' });
    }

    const report = results.map(row => {
      let classification = 'Iniciante';
      if (row.total_hours >= 6 && row.total_hours <= 10) classification = 'Intermediário';
      else if (row.total_hours >= 11 && row.total_hours <= 20) classification = 'Avançado';
      else if (row.total_hours > 20) classification = 'Extremamente avançado';

      return {
        name: row.name,
        totalHours: row.total_hours,
        classification
      };
    });

    res.status(200).json(report);
  });
});

module.exports = router;