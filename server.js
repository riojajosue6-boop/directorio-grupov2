const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS única y limpia
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Configuración de la conexión a Postgres (CORREGIDA)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Ruta de prueba
app.get('/grupos', async (req, res) => {
    try {
        // Consultamos todos para probar, luego filtramos
        const result = await pool.query('SELECT * FROM grupos');
        res.json(result.rows || []);
    } catch (err) {
        console.error("Error detallado:", err.message);
        res.status(500).json({ error: "Error en la base de datos: " + err.message });
    }
});

// RUTA: Guardar grupo
app.post('/grupos', async (req, res) => {
    const { nombre, descripcion, link, pais, plataforma_id, categoria_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO grupos (nombre, descripcion, link, pais, plataforma_id, categoria_id, estado) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [nombre, descripcion, link, pais, plataforma_id, categoria_id, 'pendiente']
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Error en POST /grupos:", err);
        res.status(500).json({ error: "Error al guardar el grupo" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});
