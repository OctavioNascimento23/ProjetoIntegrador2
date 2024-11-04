import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Para processar dados JSON no corpo da requisição

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do banco de dados MySQL
const dbConfig = {
    host: "localhost",
    user: "root",    // Substitua pelo seu usuário MySQL
    password: "sua nova senha",  // Substitua pela sua senha MySQL
    database: "projeto2"
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

// Servir arquivos estáticos (para HTML, CSS, JS etc.)
app.use(express.static(path.join(__dirname, 'AreaAluno')));

// Servir a página inicial (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'AreaAluno', 'index.html'));
});

// Servir a página de login (entrar.html)
app.get('/entrar.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'AreaAluno', 'entrar.html'));
});

// Servir a página de registro (registro.html)
app.get('/registro.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'AreaAluno', 'registro.html'));
});

// Rota para realizar o login
app.post('/login', async (req, res) => {
    const { cpf } = req.body;

    const sql = `SELECT * FROM users WHERE cpf = ?`;
    const params = [cpf];

    try {
        const result = await queryMySQL(sql, params);
        if (result.length > 0) {
            // CPF encontrado, login bem-sucedido
            res.json({ success: true, message: "Login bem-sucedido!" });
        } else {
            // CPF não encontrado, solicitar registro
            res.json({ success: false, message: "CPF não encontrado, faça o registro." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao consultar o banco de dados MySQL' });
    }
});

// Rota para registrar um novo usuário
app.post('/registro', async (req, res) => {
    const { nome, cpf, email, endereco } = req.body;

    const sql = `INSERT INTO users (nome, cpf, email, endereco) VALUES (?, ?, ?, ?)`;
    const params = [nome, cpf, email, endereco];

    try {
        await queryMySQL(sql, params);
        res.status(201).send("Usuário registrado com sucesso!");
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar no banco de dados MySQL' });
    }
});

// Iniciar o servidor
app.listen(4000, () => {
    console.log('Servidor rodando na porta 4000');
});

