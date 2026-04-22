// USA TU URL REAL DE RAILWAY AQUÍ
const API_URL = 'https://directorio-grupov2-production.up.railway.app';

const contenedor = document.getElementById('contenedor-grupos');
const formGrupo = document.getElementById('formGrupo');
const modal = document.getElementById('modalForm');

// Abrir/Cerrar Modal
document.getElementById('btnAbrirForm').onclick = () => modal.style.display = "block";
document.querySelector('.close').onclick = () => modal.style.display = "none";

// Función para cargar grupos de la DB
async function cargarGrupos() {
    try {
        const res = await fetch(`${API_URL}/grupos`);
        const grupos = await res.json();
        
        if (grupos.length === 0) {
            contenedor.innerHTML = "<p>No hay grupos publicados aún.</p>";
            return;
        }

        contenedor.innerHTML = grupos.map(g => {
            let clase = g.plataforma_id == 1 ? 'wa' : g.plataforma_id == 2 ? 'tg' : 'dc';
            return `
                <div class="card ${clase}">
                    <h4>${g.nombre}</h4>
                    <p><strong>${g.pais}</strong></p>
                    <p>${g.descripcion || ''}</p>
                    <a href="${g.link}" target="_blank" class="btn-unirse">Unirme</a>
                </div>
            `;
        }).join('');
    } catch (e) {
        contenedor.innerHTML = "<p>Error conectando al servidor.</p>";
    }
}

// Función para llenar el selector de países
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

// Función para llenar el selector de categorías
function llenarCategorias() {
    const cats = ["Amistad", "Ventas", "Juegos", "Educacion", "Tecnologia"];
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
    const datos = {
        nombre: document.getElementById('nombre').value,
        plataforma_id: parseInt(document.getElementById('plataforma').value),
        link: document.getElementById('link').value,
        categoria_id: parseInt(document.getElementById('categoria').value),
        pais: document.getElementById('pais').value,
        descripcion: document.getElementById('descripcion').value
    };

    try {
        const response = await fetch(`${API_URL}/grupos`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datos)
        });
        if (response.ok) {
            alert("¡Enviado! Aparecerá tras la revisión del admin.");
            modal.style.display = "none";
            formGrupo.reset();
        }
    } catch (err) {
        alert("No se pudo conectar con el servidor.");
    }
};

// Activar todo al cargar
window.onload = () => {
    llenarPaises();
    llenarCategorias();
    cargarGrupos();
};
