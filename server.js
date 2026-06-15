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

// Obtener grupos (MODIFICADO: Solo trae los que están en estado 'aprobado')
// Obtener grupos (CORREGIDO: Ignora mayúsculas/minúsculas y trae los aprobados)
app.get('/grupos', async (req, res) => {
    try {
        // LOWER(estado) asegura que encuentre 'Aprobado', 'aprobado' o 'APROBADO' sin problemas
        const result = await pool.query("SELECT * FROM grupos WHERE LOWER(estado) = 'aprobado'");
        res.json(result.rows || []);
    } catch (err) {
        console.error("Error en base de datos:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Guardar nuevo grupo (CORREGIDO: Entra aprobado por defecto)
// Guardar nuevo grupo (CORREGIDO: Aprobado por defecto + Limpiador de Discord)
app.post('/grupos', async (req, res) => {
    let { nombre, descripcion, link, pais, plataforma_id, categoria_id } = req.body;
    
    try {
        // --- 🛡️ LIMPIADOR DE ENLACES DE DISCORD (plataforma_id == 3) ---
        if (plataforma_id === 3 && link) {
            let limpio = link.trim();
            
            // Si no empieza con http:// o https://, se lo agregamos
            if (!limpio.startsWith('http://') && !limpio.startsWith('https://')) {
                limpio = 'https://' + limpio;
            }
            
            link = limpio;
        }

        // Insertamos el grupo con el link limpio y aprobado por defecto
        const nuevoGrupo = await pool.query(
            "INSERT INTO grupos (nombre, descripcion, link, pais, plataforma_id, categoria_id, estado) VALUES ($1, $2, $3, $4, $5, $6, 'aprobado') RETURNING *",
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
// 🛡️ NUEVA RUTA: REGISTRAR REPORTES AUTOMÁTICOS
// ==========================================
app.post('/grupos/:id/reportar', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Sumamos 1 a la columna reportes
        await pool.query('UPDATE grupos SET reportes = reportes + 1 WHERE id = $1', [id]);

        // 2. Verificamos si ese grupo ya acumuló 3 o más reportes
        // Si llega a 3, cambia su estado a 'pendiente' para ocultarlo automáticamente
        await pool.query("UPDATE grupos SET estado = 'pendiente' WHERE id = $1 AND reportes >= 3", [id]);

        res.status(200).send('Reporte procesado con éxito');
    } catch (err) {
        console.error("Error al procesar reporte:", err.message);
        res.status(500).send("Error al actualizar reportes");
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

        // 2. Traer solo los grupos aprobados (MODIFICADO para no indexar enlaces rotos)
        // Cambia la línea del sitemap por esta:
        const result = await pool.query("SELECT id FROM grupos WHERE LOWER(estado) = 'aprobado'");
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
