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

// --- LO NUEVO INSERTADO AQUÍ ---

// Función para llenar el selector de categorías
function llenarCategorias() {
    const cats = ["Amistad", "Ventas","Musica","Libros","Peliculas","Educación","Games", "Educación","Tecnología","Educación",];
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
    llenarCategorias();
    cargarGrupos();
};
