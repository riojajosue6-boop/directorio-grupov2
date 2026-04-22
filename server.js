const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a Postgres
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // REQUERIDO para conexiones externas en Railway
    }
});

// RUTA: Obtener solo grupos aprobados
app.get('/grupos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM grupos WHERE estado = $1', ['aprobado']);
        res.json(result.rows);
    } catch (err) {
        console.error("Error en GET /grupos:", err);
        res.status(500).json({ error: "Error al obtener datos" });
    }
});

// RUTA: Guardar nuevo grupo (entra como pendiente)
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

// Usamos el puerto que Railway nos dé, y si no hay ninguno, el 8080 por defecto
const PORT = process.env.PORT || 8080;

// Agregamos '0.0.0.0' para que el servidor acepte conexiones externas
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo y escuchando en el puerto ${PORT}`);
});
