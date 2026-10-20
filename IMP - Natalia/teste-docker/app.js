import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

import pg from 'pg';

const { Pool } = pg;


const porta = Number(process.env.PORT || process.env.PORTA || 8000);

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'minha_base',
});

// Verificar se a API está funcionando
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Listar tarefas
app.get('/tasks', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM tasks ORDER BY id DESC'
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao listar tarefas:', erro);
    res.status(500).json({ error: 'Erro ao listar tarefas' });
  }
});

// Criar tarefa
app.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        error: 'O título da tarefa é obrigatório',
      });
    }

    const resultado = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao criar tarefa:', erro);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// Conectar ao banco, criar a tabela e iniciar o servidor
async function iniciarServidor() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Banco de dados conectado e tabela criada!');

    app.listen(porta, () => {
      console.log(`Servidor rodando na porta: ${porta}`);
    });
  } catch (erro) {
    console.error('Erro ao conectar ou criar tabela:', erro);
    process.exit(1);
  }
}

iniciarServidor();
