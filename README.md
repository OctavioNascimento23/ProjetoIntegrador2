# Projeto Integrador 2

Nosso segundo projeto integrador, se trata de um sistema para academia. O sistema em questão irá se dividir em 3 partes, computador do aluno, totem de autoatendimento na portaria da academia e computador do gerente da academia. Utilizamos este repositório somente para armazenamento do projeto.
## Funcionalidades

### 1. Área do Aluno
- **Criação de Contas:** Alunos podem se registrar fornecendo nome, CPF e e-mail.
- **Login:** Alunos podem acessar sua classificação e visualizar o total de horas semanais treinadas.
- **URL:** [http://localhost:3000/pages/index.html](http://localhost:3000/pages/index.html)

### 2. Catraca
- **Controle de Acesso:** Registra a entrada e saída dos alunos na academia.
- **Cálculo de Horas:** Contabiliza automaticamente as horas treinadas e atualiza os dados do aluno.
- **URL:** [http://localhost:3000/pages/catraca.html](http://localhost:3000/pages/catraca.html)

### 3. Área do Gerente
- **Relatórios Semanais:** Exibe a classificação de todos os alunos com base nas horas treinadas na última semana.
- **Classificações:**
  - Iniciante
  - Intermediário (6-10 horas/semana)
  - Avançado (11-20 horas/semana)
  - Extremamente Avançado (> 20 horas/semana)
- **URL:** [http://localhost:3000/pages/gerente.html](http://localhost:3000/pages/gerente.html)

## Requisitos

- **Node.js**
- **MySQL**
- **Navegador Web**

## Instalação

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd <nome-do-repositorio>
   ```

2. **Instale as dependências:**
   ```bash
   npm install cors
   npm install body-parser
   npm install express
   npm install (modulo banco de dados)
   ```

3. **Configure o Banco de Dados:**
   - Crie o banco de dados usando o arquivo SQL localizado em `db/projetointegrador2.sql`.
   - Configure a conexão no arquivo `db/connection.js` com as credenciais do seu MySQL.

4. **Inicie o servidor:**
   ```bash
   node server.js
   ```

5. **Acesse as páginas no navegador:**
   - [Área do Aluno](http://localhost:3000/pages/index.html)
   - [Catraca](http://localhost:3000/pages/catraca.html)
   - [Área do Gerente](http://localhost:3000/pages/gerente.html)

## Estrutura do Projeto

```
├── db
│   ├── connection.js       # Arquivo de conexão com o banco de dados
│   ├── projetointegrador2.sql  # Script para criação do banco de dados
├── public
│   ├── css
│   │   └── style.css       # Estilo das páginas
│   └── js
│       └── scripts.js      # Scripts gerais
├── pages
│   ├── index.html          # Página inicial (Área do Aluno)
│   ├── catraca.html        # Página de Controle de Acesso
│   └── gerente.html        # Página do Gerente
├── server.js               # Arquivo principal do servidor
├── package.json            # Dependências e scripts do projeto
└── README.md               # Documentação do projeto
```

## Observações

- Certifique-se de que o MySQL está rodando localmente e que o banco de dados foi criado antes de iniciar o servidor.
- Todas as páginas estão configuradas para rodar no servidor Express na porta `3000`.

## Licença

Este projeto é licenciado sob a [MIT License](LICENSE).
