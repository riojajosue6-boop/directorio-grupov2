// --- CONFIGURACIÓN INICIAL ---
const API_URL = 'https://directorio-grupov2-production.up.railway.app';

const CATEGORIAS_GLOBALES = [
    "", "Amistad", "Ventas", "Gamers", "Educación", "Tecnología",
    "Empleos y Trabajo", "Cursos y Formación", "Salud y Fitness",
    "Viajes y Turismo", "Series y Películas", "Música", "Ufo y Paranormal"
];

const contenedor = document.getElementById('contenedor-grupos');
const formGrupo = document.getElementById('formGrupo');
const modal = document.getElementById('modalForm');
const inputBusqueda = document.querySelector('.search-bar input');

let listaGrupos = []; 

function limpiarTexto(texto) {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const palabrasProhibidas = ['porno', 'sexo', 'xxx', 'dating', 'estafa', 'binance', 'invertir', 'ganar dinero', 'drogas', 'narcotico', 'pildoras'];

document.getElementById('btnAbrirForm').onclick = () => modal.style.display = "block";
document.querySelector('.close').onclick = () => modal.style.display = "none";

// --- 1. FUNCIÓN DE RENDERIZADO ---
function renderizar(datos) {
    if (!datos || datos.length === 0) {
        contenedor.innerHTML = "<p style='color: #94a3b8;'>No se encontraron grupos, intenta con otra búsqueda.</p>";
        return;
    }

    contenedor.innerHTML = datos.map(g => {
        let clase = g.plataforma_id == 1 ? 'wa' : g.plataforma_id == 2 ? 'tg' : 'dc';
        const esComunidad = g.link && g.link.includes('/community/');
        const badgeClass = esComunidad ? 'badge-comunidad' : 'badge-grupo';
        const tipoTexto = esComunidad ? 'Comunidad' : 'Grupo';

        let iconoHtml = g.plataforma_id == 1 
            ? `<img src="imagen whastapp.png" alt="WA" class="platform-logo-img">` 
            : `<span class="material-icons platform-icon">${g.plataforma_id == 2 ? 'send' : 'groups'}</span>`;

        const nombreCat = CATEGORIAS_GLOBALES[g.categoria_id] || "Otros";

        return `
            <div class="card ${clase}" id="grupo-${g.id}">
                <div class="card-header">
                    <span class="categoria-tag">${nombreCat}</span>
                    <div class="icon-wrapper">${iconoHtml}</div>
                </div>
                <span class="badge ${badgeClass}">${tipoTexto}</span>
                <h4>${g.nombre}</h4>
                <p class="pais-texto"><span class="material-icons" style="font-size: 14px;">place</span> ${g.pais}</p>              
                
                <p class="desc-texto" title="${g.descripcion || 'Sin descripción'}">
                    ${g.descripcion || 'Sin descripción'}
                </p>

                <div class="vistas-info" style="display: flex; align-items: center; gap: 5px; color: #94a3b8; font-size: 12px; margin-top: 8px;">
                    <span class="material-icons" style="font-size: 14px;">visibility</span>
                    <span>${g.vistas || 0} vistas</span>
                </div>
                
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <a href="${g.link}" onclick="registrarClick(${g.id})" target="_blank" class="btn-unirse" style="flex: 1;">Unirme</a>
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
            renderizar(listaGrupos.filter(g => g.plataforma_id == idBuscado));
        }
    };
});

// --- 4. BUSCADOR ---
inputBusqueda.oninput = (e) => {
    if (listaGrupos.length === 0) return;
    const termino = limpiarTexto(e.target.value);
    const filtrados = listaGrupos.filter(g => {
        const nombreLimpio = limpiarTexto(g.nombre || "");
        const paisLimpio = limpiarTexto(g.pais || "");
        const catLimpia = limpiarTexto(CATEGORIAS_GLOBALES[g.categoria_id] || "otros");
        return nombreLimpio.includes(termino) || paisLimpio.includes(termino) || catLimpia.includes(termino);
    });
    renderizar(filtrados);
};

// --- 5. SELECTS ---
function llenarPaises() {
    const paises = ["Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda", "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice", "Benín", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre", "Ciudad del Vaticano", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Granada", "Grecia", "Guatemala", "Guyana", "Guinea", "Guinea ecuatorial", "Guinea-Bisáu", "Haití", "Honduras", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Islas Marshall", "Islas Salomón", "Israel", "Italia", "Jamaica", "Japón", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Macedonia del Norte", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Mozambique", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palaos", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia", "Portugal", "Reino Unido", "República Centroafricana", "República Checa", "República del Congo", "República Democrática del Congo", "República Dominicana", "Ruanda", "Rumanía", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino", "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suiza", "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue"];
    const selectPais = document.getElementById('pais');
    if(selectPais) {
        paises.forEach(pais => {
            let opt = document.createElement('option');
            opt.value = pais; opt.textContent = pais;
            selectPais.appendChild(opt);
        });
    }
}

function llenarCategorias() {
    const selectCat = document.getElementById('categoria');
    if(selectCat) {
        selectCat.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';
        CATEGORIAS_GLOBALES.forEach((cat, i) => {
            if (cat !== "") { 
                let opt = document.createElement('option');
                opt.value = i; opt.textContent = cat;
                selectCat.appendChild(opt);
            }
        });
    }
}

// --- 6. ENVÍO FORMULARIO ---
formGrupo.onsubmit = async (e) => {
    e.preventDefault();
    const datos = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        link: document.getElementById('link').value,
        pais: document.getElementById('pais').value,
        plataforma_id: parseInt(document.getElementById('plataforma').value),
        categoria_id: parseInt(document.getElementById('categoria').value)
    };

    const textoAnalizar = (datos.nombre + " " + datos.descripcion).toLowerCase();
    if (palabrasProhibidas.some(p => textoAnalizar.includes(p))) {
        alert("⚠️ Contenido no permitido."); return; 
    }

    try {
        const response = await fetch(`${API_URL}/grupos`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datos)
        });
        const resJson = await response.json();
        if (response.ok) {
            alert("¡Éxito!"); modal.style.display = "none";
            formGrupo.reset(); cargarGrupos(); 
        } else {
            alert("❌ " + (resJson.error || "Error al enviar."));
        }
    } catch (err) { alert("Error de conexión."); }
};

// --- 7. REPORTE Y CLICS ---
function reportarGrupo(id) {
    if (confirm("¿Reportar este grupo?")) {
        const tarjeta = document.getElementById(`grupo-${id}`);
        if(tarjeta) { tarjeta.style.opacity = '0.3'; tarjeta.style.pointerEvents = 'none'; }
        alert("Reporte enviado.");
    }
}

async function registrarClick(id) {
    try {
        await fetch(`${API_URL}/grupos/${id}/click`, { method: 'POST' });
    } catch (error) { console.error("Error vistas"); }
}

window.onload = () => {
    llenarPaises();
    llenarCategorias();
    cargarGrupos();
};
