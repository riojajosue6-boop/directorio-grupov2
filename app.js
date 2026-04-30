// REEMPLAZA ESTA URL CON TU DOMINIO DE RAILWAY
const API_URL = 'https://directorio-grupov2-production.up.railway.app';

const contenedor = document.getElementById('contenedor-grupos');
const formGrupo = document.getElementById('formGrupo');
const modal = document.getElementById('modalForm');
const inputBusqueda = document.querySelector('.search-bar input');

let listaGrupos = []; 

// Función para limpiar tildes y normalizar textos
function limpiarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const palabrasProhibidas = ['porno', 'sexo', 'xxx', 'dating', 'estafa', 'binance', 'invertir', 'ganar dinero', 'drogas', 'narcotico', 'pildoras'];

document.getElementById('btnAbrirForm').onclick = () => modal.style.display = "block";
document.querySelector('.close').onclick = () => modal.style.display = "none";

// --- 1. FUNCIÓN DE RENDERIZADO MEJORADA ---
function renderizar(datos) {
    if (!datos || datos.length === 0) {
        contenedor.innerHTML = "<p style='color: #94a3b8;'>No se encontraron grupos, intenta con otra búsqueda.</p>";
        return;
    }

    const nombresCategorias = ["Amistad", "Ventas", "Educación", "Tecnología", "Otros"];

    contenedor.innerHTML = datos.map(g => {
        let clase = g.plataforma_id == 1 ? 'wa' : g.plataforma_id == 2 ? 'tg' : 'dc';
        
        // Detección automática de Comunidad
        const esComunidad = g.link.includes('/community/');
        const badgeClass = esComunidad ? 'badge-comunidad' : 'badge-grupo';
        const tipoTexto = esComunidad ? 'Comunidad' : 'Grupo';

        let iconoHtml = g.plataforma_id == 1 
            ? `<img src="imagen whastapp.png" alt="WA" class="platform-logo-img">` 
            : `<span class="material-icons platform-icon">${g.plataforma_id == 2 ? 'send' : 'groups'}</span>`;

        const nombreCat = nombresCategorias[g.categoria_id - 1] || "Otros";

        return `
            <div class="card ${clase}" id="grupo-${g.id}">
                <div class="card-header">
                    <span class="categoria-tag">${nombreCat}</span>
                    <div class="icon-wrapper">${iconoHtml}</div>
                </div>
                <span class="badge ${badgeClass}">${tipoTexto}</span>
                <h4>${g.nombre}</h4>
                <p class="pais-texto"><span class="material-icons" style="font-size: 14px;">place</span> ${g.pais}</p>
                <p class="desc-texto">${g.descripcion || 'Sin descripción'}</p>
                
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <a href="${g.link}" target="_blank" class="btn-unirse" style="flex: 1;">Unirme</a>
                    <button onclick="reportarGrupo(${g.id})" class="btn-reportar" title="Reportar">
                        <span class="material-icons" style="font-size: 18px;">flag</span>
                    </button>
                </div>
            </div>
        `;
    }).join(''); 
}

// --- 2. CARGAR DATOS ---
async function cargarGrupos() {
    try {
        const res = await fetch(`${API_URL}/grupos`);
        listaGrupos = await res.json();
        renderizar(listaGrupos); 
    } catch (e) {
        contenedor.innerHTML = "<p>Error conectando al servidor.</p>";
    }
}

// --- 3. FILTROS LATERALES ---
document.querySelectorAll('.filtro-btn').forEach(boton => {
    boton.onclick = (e) => {
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const filtro = e.target.textContent.trim();

        if (filtro === "Todos") {
            renderizar(listaGrupos);
        } else {
            const idBuscado = filtro === "WhatsApp" ? 1 : filtro === "Telegram" ? 2 : 3;
            const filtrados = listaGrupos.filter(g => g.plataforma_id == idBuscado);
            renderizar(filtrados);
        }
    };
});

// --- 4. BUSCADOR INTELIGENTE (Sin Tildes) ---
inputBusqueda.oninput = (e) => {
    const termino = limpiarTexto(e.target.value);
    
    const filtrados = listaGrupos.filter(g => {
        return limpiarTexto(g.nombre).includes(termino) || 
               limpiarTexto(g.pais).includes(termino);
    });

    renderizar(filtrados);
};

// ... (El resto de tus funciones: llenarPaises, llenarCategorias, formGrupo.onsubmit y reportarGrupo se mantienen igual)
// Asegúrate de copiar las funciones restantes de tu código original después de esta línea para no perder nada.
