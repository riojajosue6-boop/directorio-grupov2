const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN CLAVE PARA CONEXIÓN PÚBLICA
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Esto evita que Railway bloquee la conexión externa
    }
});

app.get('/grupos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM grupos WHERE estado = $1', ['aprobado']);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/grupos', async (req, res) => {
    const { nombre, descripcion, link, pais, plataforma_id, categoria_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO grupos (nombre, descripcion, link, pais, plataforma_id, categoria_id, estado) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [nombre, descripcion, link, pais, plataforma_id, categoria_id, 'pendiente']
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
