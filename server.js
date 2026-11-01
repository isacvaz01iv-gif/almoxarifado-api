const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração da Base de Dados Neon.tech
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware para processar JSON e permitir requisições (CORS manual seguro)
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rota de Teste do Servidor
app.get('/', (req, res) => {
  res.send('Servidor do Almoxarifado a funcionar corretamente!');
});

// Rota de Login (Ligada à tabela 'usuarios' com colunas 'login' e 'senha_hash')
app.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  
  if (!usuario || !senha) {
    return res.status(400).json({ sucesso: false, erro: "Preencha o utilizador e a palavra-passe." });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE login = $1 AND senha_hash = $2',
      [usuario, senha]
    );
    
    if (result.rows.length > 0) {
      res.json({ sucesso: true, mensagem: "Login bem-sucedido!" });
    } else {
      res.status(401).json({ sucesso: false, erro: "Utilizador ou palavra-passe incorretos." });
    }
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ sucesso: false, erro: "Erro interno no servidor." });
  }
});

// Iniciar o Servidor
app.listen(port, () => {
  console.log(`Servidor a rodar na porta ${port}`);
});

