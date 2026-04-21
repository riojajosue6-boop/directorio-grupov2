const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos usando la variable de Railway
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Ruta para obtener grupos (los que están aprobados)
app.get('/grupos', async (req, res) => {
    try {
        const result = await pool.query('SELECT g.*, p.nombre as plataforma, c.nombre as categoria FROM grupos g JOIN plataformas p ON g.plataforma_id = p.id JOIN categorias c ON g.categoria_id = c.id WHERE g.estado = $1', ['aprobado']);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para que el usuario suba un grupo
app.post('/grupos', async (req, res) => {
    const { nombre, descripcion, link, pais, plataforma_id, categoria_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO grupos (nombre, descripcion, link, pais, plataforma_id, categoria_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, descripcion, link, pais, plataforma_id, categoria_id]
        );
        res.json({ success: true, grupo: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al guardar. Quizás el link ya existe." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
