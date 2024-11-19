import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do banco de dados MySQL
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "sua nova senha",
    database: process.env.DB_NAME || "projeto2"
};

// Função para conectar ao MySQL e executar uma query
async function queryMySQL(sql, params = []) {
    let con;
    try {
        con = await mysql.createConnection(dbConfig);
        const [result] = await con.execute(sql, params);
        return result;
    } catch (err) {
        console.error('Erro ao criar a conexão', err);
        throw err;
    } finally {
        if (con) {
            try {
                await con.end();
            } catch (err2) {
                console.error('Erro ao fechar a conexão', err2);
            }
        }
    }
}

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'AreaAluno')));

// Servir a página principal (catraca)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'AreaAluno', 'catraca.html')));

// Rota para registrar entrada
app.post('/entrada', async (req, res) => {
    const { cpf } = req.body;

    try {
        const [aluno] = await queryMySQL('SELECT id FROM users WHERE cpf = ?', [cpf]);
        if (!aluno) {
            return res.status(404).json({ success: false, message: "Usuário não encontrado." });
        }

        const sql = "INSERT INTO acessos (aluno_id, data_entrada) VALUES (?, NOW())";
        await queryMySQL(sql, [aluno.id]);

        res.json({ success: true, message: "Entrada registrada com sucesso!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erro ao registrar entrada." });
    }
});

// Rota para registrar saída
app.post('/saida', async (req, res) => {
    const { cpf } = req.body;

    try {
        const [aluno] = await queryMySQL('SELECT id FROM users WHERE cpf = ?', [cpf]);
        if (!aluno) {
            return res.status(404).json({ success: false, message: "Usuário não encontrado." });
        }

        const sql = `UPDATE acessos 
                     SET data_saida = NOW() 
                     WHERE aluno_id = ? AND data_saida IS NULL
                     ORDER BY data_entrada DESC LIMIT 1`;
        const result = await queryMySQL(sql, [aluno.id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ success: false, message: "Nenhum registro de entrada encontrado." });
        }

        res.json({ success: true, message: "Saída registrada com sucesso!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erro ao registrar saída." });
    }
});

// Iniciar o servidor
app.listen(4000, () => {
    console.log('Servidor rodando na porta 4000');
});
