// CONFIGURACIÓN DE CONEXIÓN
const DATABASE_URL = 'postgresql://postgres:NbfRZqWuRNNhQGqPWDBiVGZTzDjsPTGL@shinkansen.proxy.rlwy.net:23960/railway'; // Esto lo ajustaremos al final

// Elementos de la Interfaz
const contenedor = document.getElementById('contenedor-grupos');
const formGrupo = document.getElementById('formGrupo');
const modal = document.getElementById('modalForm');
const btnAbrir = document.getElementById('btnAbrirForm');
const btnCerrar = document.querySelector('.close');
const filtroBtns = document.querySelectorAll('.filtro-btn');
const buscador = document.getElementById('buscador');

// 1. ABRIR Y CERRAR FORMULARIO
btnAbrir.onclick = () => modal.style.display = "block";
btnCerrar.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }

// 2. CARGAR CATEGORÍAS (Para que el formulario sea dinámico)
async function cargarCategorias() {
    // Por ahora las pondremos fijas para que la web funcione de inmediato
    const cats = ["Amistad", "Ventas", "Juegos", "Educación", "Tecnología"];
    const selectCat = document.getElementById('categoria');
    cats.forEach((cat, index) => {
        let option = document.createElement('option');
        option.value = index + 1;
        option.textContent = cat;
        selectCat.appendChild(option);
    });
}

// 3. VALIDACIÓN DE LINKS (Seguridad automática)
function validarLink(url, plataforma) {
    const link = url.toLowerCase();
    if (plataforma == "1" && !link.includes("chat.whatsapp.com")) return "El link no es de WhatsApp válido.";
    if (plataforma == "2" && !link.includes("t.me")) return "El link no es de Telegram válido.";
    if (plataforma == "3" && !link.includes("discord.gg")) return "El link no es de Discord válido.";
    return true;
}

// 4. GUARDAR NUEVO GRUPO
formGrupo.onsubmit = async (e) => {
    e.preventDefault();
    
    const nuevoGrupo = {
        nombre: document.getElementById('nombre').value,
        plataforma_id: document.getElementById('plataforma').value,
        link: document.getElementById('link').value,
        categoria_id: document.getElementById('categoria').value,
        pais: document.getElementById('pais').value || 'Global',
        descripcion: document.getElementById('descripcion').value
    };

    // Validar antes de enviar
    const validacion = validarLink(nuevoGrupo.link, nuevoGrupo.plataforma_id);
    if (validacion !== true) {
        alert(validacion);
        return;
    }

    alert("¡Enviado! Tu grupo se publicará tras la revisión de seguridad (Simulado por ahora)");
    modal.style.display = "none";
    formGrupo.reset();
};

// 5. RENDERIZAR TARJETAS DE GRUPOS
function crearTarjeta(grupo) {
    const clasePlataforma = grupo.plataforma == 'WhatsApp' ? 'wa' : grupo.plataforma == 'Telegram' ? 'tg' : 'dc';
    
    return `
        <div class="card ${clasePlataforma}">
            <h4>${grupo.nombre}</h4>
            <p><strong>${grupo.categoria}</strong> | ${grupo.pais}</p>
            <p>${grupo.descripcion || 'Sin descripción.'}</p>
            <a href="${grupo.link}" target="_blank" class="btn-unirse">Unirme al Grupo</a>
            <div style="text-align:right; margin-top:10px;">
                <small style="cursor:pointer; color:#ef4444;" onclick="reportar('${grupo.id}')">
                    <span class="material-icons" style="font-size:12px;">flag</span> Reportar
                </small>
            </div>
        </div>
    `;
}

// 6. FUNCIÓN DE REPORTE (Auto-moderación)
function reportar(id) {
    alert("Gracias. Si este grupo recibe más reportes, será ocultado automáticamente.");
}

// 7. INICIO
window.onload = () => {
    cargarCategorias();
    // Aquí cargaríamos los datos reales de la base de datos
    contenedor.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>La base de datos está lista. Pronto verás aquí los grupos de los usuarios.</p>";
};
