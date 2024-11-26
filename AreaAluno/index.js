import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do banco de dados MySQL
const dbConfig = {
    host: "localhost",
    user: "root", 
    password: "root",  
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

// Função para calcular as horas semanais treinadas
async function calcularHorasTreinadas(cpf) {
    const sql = `
        SELECT aluno_id, SUM(TIMESTAMPDIFF(HOUR, data_entrada, data_saida)) AS horas_treinadas
        FROM acessos
        WHERE aluno_id = (SELECT id FROM users WHERE cpf = ?)
        AND data_entrada >= NOW() - INTERVAL 1 WEEK
        GROUP BY aluno_id;
    `;
    const result = await queryMySQL(sql, [cpf]);
    return result.length > 0 ? result[0].horas_treinadas : 0;
}

// Função para classificar o usuário com base nas horas treinadas
function classificarNivel(horas) {
    if (horas <= 5) return 'Iniciante';
    if (horas >= 6 && horas <= 10) return 'Intermediário';
    if (horas >= 11 && horas <= 20) return 'Avançado';
    return 'Extremamente avançado';
}

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'AreaAluno', 'index.html'));
});

// Servir arquivos estáticos (para HTML, CSS, JS etc.)
app.use(express.static(path.join(__dirname, 'AreaAluno')));

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

// Rota para registrar a entrada
app.post('/entrada', async (req, res) => {
    const { cpf } = req.body;

    try {
        const [aluno] = await queryMySQL('SELECT id FROM users WHERE cpf = ?', [cpf]);
        if (!aluno) {
            return res.status(404).json({ success: false, message: "Aluno não encontrado." });
        }

        const sql = `INSERT INTO acessos (aluno_id, data_entrada) VALUES (?, NOW())`;
        await queryMySQL(sql, [aluno.id]);

        res.json({ success: true, message: "Entrada registrada com sucesso!" });
    } catch (error) {
        console.error('Erro ao registrar entrada:', error);
        res.status(500).json({ success: false, message: "Erro ao registrar entrada." });
    }
});

// Rota para registrar a saída
app.post('/saida', async (req, res) => {
    const { cpf } = req.body;

    try {
        const [aluno] = await queryMySQL('SELECT id FROM users WHERE cpf = ?', [cpf]);
        if (!aluno) {
            return res.status(404).json({ success: false, message: "Aluno não encontrado." });
        }

        const sql = `UPDATE acessos SET data_saida = NOW() WHERE aluno_id = ? AND data_saida IS NULL ORDER BY data_entrada DESC LIMIT 1`;
        const result = await queryMySQL(sql, [aluno.id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ success: false, message: "Nenhum registro de entrada encontrado." });
        }

        res.json({ success: true, message: "Saída registrada com sucesso!" });
    } catch (error) {
        console.error('Erro ao registrar saída:', error);
        res.status(500).json({ success: false, message: "Erro ao registrar saída." });
    }
});

// Rota para obter o relatório de horas treinadas e classificação
app.get('/relatorio/:cpf', async (req, res) => {
    const { cpf } = req.params;
    
    try {
        const horasTreinadas = await calcularHorasTreinadas(cpf);
        const nivel = classificarNivel(horasTreinadas);

        res.json({
            success: true,
            horasTreinadas,
            nivel
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erro ao gerar o relatório." });
    }
});

// Iniciar o servidor
app.listen(4000, () => {
    console.log('Servidor rodando na porta 4000');
});
