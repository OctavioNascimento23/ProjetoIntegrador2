import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração do diretório estático e caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'AreaAluno')));

// Configuração do banco de dados MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'projeto2'
};

// Função para conectar ao MySQL e executar uma query
async function queryMySQL(sql, params = []) {
    let con;
    try {
        con = await mysql.createConnection(dbConfig);
        const [result] = await con.execute(sql, params);
        return result;
    } catch (err) {
        console.error('Erro ao executar consulta MySQL:', err);
        throw err;
    } finally {
        if (con) {
            await con.end();
        }
    }
}

// Rotas para páginas HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'AreaAluno', 'index.html')));
app.get('/entrar.html', (req, res) => res.sendFile(path.join(__dirname, 'AreaAluno', 'entrar.html')));
app.get('/registro.html', (req, res) => res.sendFile(path.join(__dirname, 'AreaAluno', 'registro.html')));
app.get('/relatorio.html', (req, res) => res.sendFile(path.join(__dirname, 'AreaAluno', 'relatorio.html')));
app.get('/catraca.html', (req, res) => res.sendFile(path.join(__dirname, 'AreaAluno', 'catraca.html')));

// Rota para registrar um novo usuário
app.post('/registro', async (req, res) => {
    console.log("Requisição de registro recebida");

    const { nome, cpf, email, endereco } = req.body;

    const checkSql = 'SELECT * FROM users WHERE cpf = ?';
    try {
        const result = await queryMySQL(checkSql, [cpf]);
        
        if (result.length > 0) {
            return res.status(400).json({ success: false, message: 'CPF já registrado.' });
        }

        const sql = 'INSERT INTO users (nome, cpf, email, endereco) VALUES (?, ?, ?, ?)';
        await queryMySQL(sql, [nome, cpf, email, endereco]);

        res.status(201).json({ success: true, message: 'Usuário registrado com sucesso!' });
    } catch (err) {
        console.error("Erro ao registrar usuário:", err);
        res.status(500).json({ success: false, message: 'Erro ao registrar usuário.' });
    }
});




// Rota para login do aluno
app.post('/login', async (req, res) => {
    const { cpf } = req.body;

    const sql = `SELECT * FROM users WHERE cpf = ?`;
    try {
        const result = await queryMySQL(sql, [cpf]);
        if (result.length > 0) {
            res.json({ success: true, message: 'Login bem-sucedido!' });
        } else {
            res.json({ success: false, message: 'CPF não encontrado. Faça o registro.' });
        }
    } catch (err) {
        console.error('Erro ao realizar login:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }
});

// Rota para gerar o relatório do aluno
app.get('/relatorio/:cpf', async (req, res) => {
    const { cpf } = req.params;

    const sql = `
        SELECT aluno_id, SUM(TIMESTAMPDIFF(HOUR, data_entrada, data_saida)) AS horas_treinadas
        FROM acessos
        WHERE aluno_id = (SELECT id FROM users WHERE cpf = ?)
        AND data_entrada >= NOW() - INTERVAL 1 WEEK
        GROUP BY aluno_id;
    `;

    try {
        const result = await queryMySQL(sql, [cpf]);
        const horasTreinadas = result.length > 0 ? result[0].horas_treinadas : 0;

        let nivel = 'Iniciante';
        if (horasTreinadas > 5 && horasTreinadas <= 10) nivel = 'Intermediário';
        else if (horasTreinadas > 10 && horasTreinadas <= 20) nivel = 'Avançado';
        else if (horasTreinadas > 20) nivel = 'Extremamente Avançado';

        res.json({
            success: true,
            horasTreinadas,
            nivel
        });
    } catch (err) {
        console.error('Erro ao gerar relatório:', err);
        res.status(500).json({ success: false, message: 'Erro ao gerar relatório.' });
    }
});

// Rota para registrar entrada na academia
app.post('/entrada', async (req, res) => {
    const { cpf } = req.body;

    try {
        const [aluno] = await queryMySQL('SELECT id FROM users WHERE cpf = ?', [cpf]);
        if (!aluno) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        const sql = 'INSERT INTO acessos (aluno_id, data_entrada) VALUES (?, NOW())';
        await queryMySQL(sql, [aluno.id]);

        res.json({ success: true, message: 'Entrada registrada com sucesso!' });
    } catch (err) {
        console.error('Erro ao registrar entrada:', err);
        res.status(500).json({ success: false, message: 'Erro ao registrar entrada.' });
    }
});

// Rota para registrar saída da academia
app.post('/saida', async (req, res) => {
    const { cpf } = req.body;

    try {
        const [aluno] = await queryMySQL('SELECT id FROM users WHERE cpf = ?', [cpf]);
        if (!aluno) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        const [registroAberto] = await queryMySQL(
            `SELECT id FROM acessos 
             WHERE aluno_id = ? AND data_saida IS NULL 
             ORDER BY data_entrada DESC LIMIT 1`,
            [aluno.id]
        );

        if (!registroAberto) {
            return res.status(400).json({ success: false, message: 'Nenhuma entrada registrada para saída.' });
        }

        const sql = 'UPDATE acessos SET data_saida = NOW() WHERE id = ?';
        await queryMySQL(sql, [registroAberto.id]);

        res.json({ success: true, message: 'Saída registrada com sucesso!' });
    } catch (err) {
        console.error('Erro ao registrar saída:', err);
        res.status(500).json({ success: false, message: 'Erro ao registrar saída.' });
    }
});

// Iniciar o servidor
app.listen(4000, () => {
    console.log('Servidor rodando na porta 4000');
});


