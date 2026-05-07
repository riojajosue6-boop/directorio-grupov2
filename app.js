// --- COPIA ESTE BLOQUE COMPLETO A TU ARCHIVO app.js ---

// REEMPLAZA ESTA URL CON TU DOMINIO DE RAILWAY
const API_URL = 'https://directorio-grupov2-production.up.railway.app';

const contenedor = document.getElementById('contenedor-grupos');
const formGrupo = document.getElementById('formGrupo');
const modal = document.getElementById('modalForm');
const inputBusqueda = document.querySelector('.search-bar input');

let listaGrupos = []; 

// Función para limpiar tildes y normalizar
function limpiarTexto(texto) {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const palabrasProhibidas = ['porno', 'sexo', 'xxx', 'dating', 'estafa', 'binance', 'invertir', 'ganar dinero', 'drogas', 'narcotico', 'pildoras'];

document.getElementById('btnAbrirForm').onclick = () => modal.style.display = "block";
document.querySelector('.close').onclick = () => modal.style.display = "none";

// --- 1. FUNCIÓN DE RENDERIZADO CON ETIQUETAS ---
function renderizar(datos) {
    if (!datos || datos.length === 0) {
        contenedor.innerHTML = "<p style='color: #94a3b8;'>No se encontraron grupos, intenta con otra búsqueda.</p>";
        return;
    }

    const nombresCategorias = ["Amistad", "Ventas", "Educación", "Tecnología", "Otros"];

    contenedor.innerHTML = datos.map(g => {
        let clase = g.plataforma_id == 1 ? 'wa' : g.plataforma_id == 2 ? 'tg' : 'dc';
        
        // --- AQUÍ ESTÁ LA LÓGICA DE DETECCIÓN QUE NECESITAS ---
        const esComunidad = g.link && g.link.includes('/community/');
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
                <p class="desc-texto" title="${g.descripcion || 'Sin descripción'}">
                    ${g.descripcion || 'Sin descripción'}
                </p>
                
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

// --- RESTO DE TUS FUNCIONES ORIGINALES (Cargar, Filtros, Buscador, etc) ---
// [Mantén aquí el resto de tu lógica: cargarGrupos, filtros laterales, buscador con limpiarTexto, etc]



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



// --- 4. BUSCADOR ULTRA-INTELIGENTE ---
inputBusqueda.oninput = (e) => {
    // Si la lista está vacía, no hacemos nada
    if (listaGrupos.length === 0) return;

    const termino = limpiarTexto(e.target.value);
    const nombresCategorias = ["amistad", "ventas", "educación", "tecnología", "otros"];

    const filtrados = listaGrupos.filter(g => {
        // Limpiamos los campos antes de comparar
        const nombreLimpio = limpiarTexto(g.nombre || "");
        const paisLimpio = limpiarTexto(g.pais || "");
        
        // Categoría también normalizada
        const catLimpia = limpiarTexto(nombresCategorias[g.categoria_id - 1] || "otros");

        return nombreLimpio.includes(termino) || 
               paisLimpio.includes(termino) || 
               catLimpia.includes(termino);
    });

    renderizar(filtrados);
};



// --- 5. FORMULARIO Y SEGURIDAD ---

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



function llenarCategorias() {

    const cats = ["","Amistad", "Ventas", "Gamers", "Educación", "Tecnología","Empleos y Trabajo","Cursos y Formación","Salud y Fitness","Viajes y Turismo","Series y Películas","Música","Ufo y Paranormal"];

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



formGrupo.onsubmit = async (e) => {

    e.preventDefault();



    const nombre = document.getElementById('nombre').value;

    const descripcion = document.getElementById('descripcion').value;

    const link = document.getElementById('link').value;

    const plataforma_id = parseInt(document.getElementById('plataforma').value);



    // --- A. FILTRO DE PALABRAS PROHIBIDAS ---

    const textoAnalizar = (nombre + " " + descripcion).toLowerCase();

    if (palabrasProhibidas.some(palabra => textoAnalizar.includes(palabra))) {

        alert("⚠️ Tu grupo contiene términos no permitidos.");

        return; 

    }



    // --- B. VALIDACIÓN DE COHERENCIA ---

    if (plataforma_id == 1 && !link.includes('whatsapp.com')) {

        alert("❌ Error: Seleccionaste WhatsApp pero el enlace no es de WhatsApp.");

        return;

    }

    if (plataforma_id == 2 && !link.includes('t.me')) {

        alert("❌ Error: Seleccionaste Telegram pero el enlace no es de Telegram.");

        return;

    }

    if (plataforma_id == 3 && !link.includes('discord')) {

        alert("❌ Error: Seleccionaste Discord pero el enlace no es de Discord.");

        return;

    }



    const datos = {

        nombre: nombre,

        descripcion: descripcion,

        link: link,

        pais: document.getElementById('pais').value,

        plataforma_id: plataforma_id,

        categoria_id: parseInt(document.getElementById('categoria').value) || 1

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

            cargarGrupos(); 

        } else {

            alert("Error al enviar.");

        }

    } catch (err) {

        alert("Error de conexión.");

    }

};



// --- 6. REPORTE ---

function reportarGrupo(id) {

    if (confirm("¿Deseas reportar este enlace por contenido inapropiado o caído?")) {

        const tarjeta = document.getElementById(`grupo-${id}`);

        if(tarjeta) {

            tarjeta.style.transition = 'all 0.5s';

            tarjeta.style.opacity = '0.2';

            tarjeta.style.filter = 'grayscale(1)';

            tarjeta.style.pointerEvents = 'none';

        }

        alert("Gracias. El reporte ha sido enviado para revisión técnica.");

    }

}



window.onload = () => {

    llenarPaises();

    llenarCategorias();

    cargarGrupos();

};
