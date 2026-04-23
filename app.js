// REEMPLAZA ESTA URL CON TU DOMINIO DE RAILWAY (Sin barra al final)
const API_URL = 'https://directorio-grupov2-production.up.railway.app';

const contenedor = document.getElementById('contenedor-grupos');
const formGrupo = document.getElementById('formGrupo');
const modal = document.getElementById('modalForm');
const inputBusqueda = document.querySelector('.search-bar input'); // Referencia para el buscador

let listaGrupos = []; // Memoria temporal para guardar los grupos de la DB

// Abrir/Cerrar Modal
document.getElementById('btnAbrirForm').onclick = () => modal.style.display = "block";
document.querySelector('.close').onclick = () => modal.style.display = "none";

// --- FUNCIÓN DE RENDERIZADO (Dibuja las cards) ---
function renderizar(datos) {
    if (!datos || datos.length === 0) {
        contenedor.innerHTML = "<p style='color: #94a3b8;'>No se encontraron grupos.</p>";
        return;
    }

    // Mapeo de IDs a nombres de categoría para mostrar en la card
    const nombresCategorias = ["Amistad", "Ventas", "Educación", "Tecnología", "Otros"];

    contenedor.innerHTML = datos.map(g => {
        let clase = '';
        let icono = '';
        
        // Configuración según plataforma
        if(g.plataforma_id == 1) { clase = 'wa'; icono = 'maps_ugc'; } 
        else if(g.plataforma_id == 2) { clase = 'tg'; icono = 'send'; } 
        else { clase = 'dc'; icono = 'groups'; }

        const nombreCat = nombresCategorias[g.categoria_id - 1] || "Otros";

        return `
            <div class="card ${clase}">
                <div class="card-header">
                    <span class="categoria-tag">${nombreCat}</span>
                    <span class="material-icons platform-icon">${icono}</span>
                </div>
                <h4>${g.nombre}</h4>
                <p class="pais-texto"><span class="material-icons" style="font-size: 14px;">place</span> ${g.pais}</p>
                <p class="desc-texto">${g.descripcion || 'Sin descripción'}</p>
                <a href="${g.link}" target="_blank" class="btn-unirse">Unirme</a>
            </div>
        `;
    }).join('');
}

// Cargar grupos desde la DB
async function cargarGrupos() {
    try {
        const res = await fetch(`${API_URL}/grupos`);
        listaGrupos = await res.json();
        renderizar(listaGrupos); // Al cargar, mostramos todos
    } catch (e) {
        contenedor.innerHTML = "<p>Error conectando al servidor.</p>";
    }
}

// --- PUNTO 2: FILTROS LATERALES ---
document.querySelectorAll('.filtro-btn').forEach(boton => {
    boton.onclick = (e) => {
        // Estética: Quitar clase activa de todos y ponerla en el actual
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

// --- PUNTO 3: BUSCADOR INTELIGENTE ---
inputBusqueda.oninput = (e) => {
    const termino = e.target.value.toLowerCase();
    const filtrados = listaGrupos.filter(g => 
        g.nombre.toLowerCase().includes(termino) || 
        g.pais.toLowerCase().includes(termino)
    );
    renderizar(filtrados);
};

// Llenar selector de países
function llenarPaises() {
    const paises = ["Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda", "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice", "Benín", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre", "Ciudad del Vaticano", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Granada", "Grecia", "Guatemala", "Guyana", "Guinea", "Guinea ecuatorial", "Guinea-Bisáu", "Haití", "Honduras", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Islas Marshall", "Islas Salomón", "Israel", "Italia", "Jamaica", "Japón", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Macedonia del Norte", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Mozambique", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palaos", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia", "Portugal", "Reino Unido", "República Centroafricana", "República Checa", "República del Congo", "República Democrática del Congo", "República Dominicana", "Ruanda", "Rumanía", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino", "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suiza", "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue"];
    const selectPais = document.getElementById('pais');
    if(selectPais) {
        paises.forEach(pais => {
            let opt = document.createElement('option');
            opt.value = pais;
            opt.textContent = pais;
            selectPais.appendChild(opt);
        });
    }
}

// Llenar selector de categorías
function llenarCategorias() {
    const cats = ["Amistad", "Ventas", "Educación", "Tecnología", "Otros"];
    const selectCat = document.getElementById('categoria');
    if(selectCat) {
        selectCat.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';
        cats.forEach((cat, i) => {
            let opt = document.createElement('option');
            opt.value = i + 1;
            opt.textContent = cat;
            selectCat.appendChild(opt);
        });
    }
}

// Guardar grupo
formGrupo.onsubmit = async (e) => {
    e.preventDefault();
    const link = document.getElementById('link').value;
    let plataforma_id = 1; 
    if (link.includes('t.me')) plataforma_id = 2;
    if (link.includes('discord')) plataforma_id = 3;

    const datos = {
        nombre: document.getElementById('nombre').value,
        plataforma_id: plataforma_id,
        link: link,
        categoria_id: parseInt(document.getElementById('categoria').value) || 1,
        pais: document.getElementById('pais').value,
        descripcion: document.getElementById('descripcion').value || ""
    };

    try {
        const response = await fetch(`${API_URL}/grupos`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datos)
        });
        if (response.ok) {
            alert("¡Enviado con éxito!");
            modal.style.display = "none";
            formGrupo.reset();
        } else {
            alert("Error al enviar. Revisa la consola.");
        }
    } catch (err) {
        alert("Error de conexión.");
    }
};

// Arranque
window.onload = () => {
    llenarPaises();
    llenarCategorias();
    cargarGrupos();
};
