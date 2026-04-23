const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS para permitir conexiones desde GitHub Pages
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Conexión a la base de datos usando la variable de Railway
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Ruta de prueba inicial
app.get('/', (req, res) => {
    res.send('Servidor de MundoGrupos funcionando correctamente');
});

// Obtener grupos
app.get('/grupos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM grupos');
        res.json(result.rows || []);
    } catch (err) {
        console.error("Error en base de datos:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Guardar nuevo grupo
app.post('/grupos', async (req, res) => {
    const { nombre, descripcion, link, pais, plataforma_id, categoria_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO grupos (nombre, descripcion, link, pais, plataforma_id, categoria_id, estado) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [nombre, descripcion, link, pais, plataforma_id, categoria_id, 'aprobado']
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Error al guardar:", err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});
