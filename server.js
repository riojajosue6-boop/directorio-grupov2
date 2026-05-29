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
        if (err.code === '23505') {
            return res.status(400).json({ error: "Este enlace de grupo ya está registrado en nuestra base de datos." });
        }
        console.error(err.message);
        res.status(500).send("Error del servidor");
    }
});

// Registrar clics/vistas en los grupos
app.post('/grupos/:id/click', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE grupos SET vistas = vistas + 1 WHERE id = $1', [id]);
        res.status(200).send('Vista contabilizada');
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error al actualizar vistas");
    }
});

// ==========================================
// 🗺️ RUTA DEL SITEMAP DINÁMICO PARA GOOGLE
// ==========================================
app.get('/sitemap.xml', async (req, res) => {
    try {
        // 1. Páginas fijas de tu directorio
        const paginasEstaticas = [
            "https://mundogrupos.com/",
            "https://mundogrupos.com/aviso-legal.html",
            "https://mundogrupos.com/privacidad.html",
            "https://mundogrupos.com/cookies.html",
            "https://mundogrupos.com/guia-seguridad.html",
            "https://mundogrupos.com/crecer-grupos.html"
        ];

        // 2. Traer todos los grupos de tu base de datos en Railway
        const result = await pool.query('SELECT id FROM grupos');
        const grupos = result.rows || [];

        // 3. Empezar a armar la estructura XML que lee Google
        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Añadir las páginas estáticas
        paginasEstaticas.forEach(url => {
            xml += `<url><loc>${url}</loc><changefreq>daily</changefreq></url>`;
        });

        // Añadir cada grupo dinámicamente usando su ID real
        grupos.forEach(grupo => {
            const linkGrupo = `https://mundogrupos.com/grupo/${grupo.id}`;
            xml += `<url><loc>${linkGrupo}</loc><changefreq>weekly</changefreq></url>`;
        });

        xml += '</urlset>';

        // 4. Enviar el archivo XML oficial al buscador
        res.header('Content-Type', 'application/xml');
        res.status(200).send(xml);

    } catch (err) {
        console.error("Error al generar sitemap:", err.message);
        res.status(500).send("Error interno del servidor");
    }
});

// ==========================================
// 🚀 ARRANQUE DEL SERVIDOR (Siempre al último)
// ==========================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});
