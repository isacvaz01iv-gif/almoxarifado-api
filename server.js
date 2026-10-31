const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// Permitir que o servidor sirva arquivos estáticos (HTML, CSS, etc.) da pasta atual
app.use(express.static(__dirname));

// Conexão com o PostgreSQL na nuvem (Neon.tech)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Rota raiz: Abre automaticamente a tela de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para abrir o painel principal
app.get('/painel', (req, res) => {
  res.sendFile(path.join(__dirname, 'painel.html'));
});

// 1. Rota para listar todas as 26 lojas cadastradas na base de dados
app.get('/api/lojas', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM lojas ORDER BY codigo ASC');
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar lojas' });
  }
});

// 2. Rota de Login do Administrador / Gestor
app.post('/api/login', async (req, res) => {
  const { login, senha } = req.body;
  try {
    const resultado = await pool.query('SELECT * FROM usuarios WHERE login = $1 AND ativo = TRUE', [login]);
    
    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Utilizador não encontrado' });
    }

    const usuario = resultado.rows[0];

    // Retorna sucesso e os dados básicos do gestor mestre
    res.json({ 
      mensagem: 'Login realizado com sucesso!',
      usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

// Iniciar o servidor na porta definida ou 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
