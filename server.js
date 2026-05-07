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
        const nuevoGrupo = await pool.query(
            "INSERT INTO grupos (nombre, descripcion, link, pais, plataforma_id, categoria_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [nombre, descripcion, link, pais, plataforma_id, categoria_id]
        );
        res.json(nuevoGrupo.rows[0]);
    } catch (err) {
        // --- AQUÍ ESTÁ LA MAGIA ---
        if (err.code === '23505') {
            return res.status(400).json({ error: "Este enlace de grupo ya está registrado en nuestra base de datos." });
        }
        console.error(err.message);
        res.status(500).send("Error del servidor");
    }
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});
