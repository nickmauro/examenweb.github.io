const preguntasContainer = document.getElementById('preguntas-container');
let preguntaIndex = 0;

function crearPregunta() {
    preguntaIndex++;

    const preguntaContainer = document.createElement('div');
    preguntaContainer.classList.add('pregunta-container');
    preguntaContainer.setAttribute('data-index', preguntaIndex);

    const eliminarBtn = document.createElement('button');
    eliminarBtn.classList.add('eliminar-pregunta');
    eliminarBtn.textContent = 'X';
    eliminarBtn.onclick = () => {
        preguntaContainer.remove();
    };

    preguntaContainer.innerHTML = `
        <label for="tipo-${preguntaIndex}">Tipo de Pregunta:</label>
        <select id="tipo-${preguntaIndex}" name="tipo-${preguntaIndex}" onchange="cambiarTipoPregunta(${preguntaIndex})">
            <option value="radio">Respuesta única (Radio)</option>
            <option value="checkbox">Múltiples respuestas (Checkbox)</option>
        </select>

        <label for="pregunta-${preguntaIndex}">Pregunta:</label>
        <input type="text" id="pregunta-${preguntaIndex}" name="pregunta-${preguntaIndex}" required>

        <div class="opciones-container" id="opciones-container-${preguntaIndex}">
            ${crearOpciones(preguntaIndex, "radio")}
        </div>
    `;

    preguntaContainer.appendChild(eliminarBtn);
    preguntasContainer.appendChild(preguntaContainer);
}

function crearOpciones(index, tipo) {
    return `
        <label for="opcionA-${index}">
            <input type="${tipo}" id="correctaA-${index}" name="correcta-${index}" value="A"> 
            <input type="text" id="opcionA-${index}" name="opcionA-${index}" placeholder="Opción A" required>
        </label>
        <label for="opcionB-${index}">
            <input type="${tipo}" id="correctaB-${index}" name="correcta-${index}" value="B"> 
            <input type="text" id="opcionB-${index}" name="opcionB-${index}" placeholder="Opción B" required>
        </label>
        <label for="opcionC-${index}">
            <input type="${tipo}" id="correctaC-${index}" name="correcta-${index}" value="C"> 
            <input type="text" id="opcionC-${index}" name="opcionC-${index}" placeholder="Opción C">
        </label>
        <label for="opcionD-${index}">
            <input type="${tipo}" id="correctaD-${index}" name="correcta-${index}" value="D"> 
            <input type="text" id="opcionD-${index}" name="opcionD-${index}" placeholder="Opción D">
        </label>
    `;
}

function cambiarTipoPregunta(index) {
    const tipo = document.getElementById(`tipo-${index}`).value;
    const opcionesContainer = document.getElementById(`opciones-container-${index}`);

    if (tipo === 'radio') {
        opcionesContainer.innerHTML = crearOpciones(index, "radio");
    } else {
        opcionesContainer.innerHTML = crearOpciones(index, "checkbox");
    }
}

document.getElementById('agregar-pregunta-btn').onclick = crearPregunta;

document.getElementById('guardar-cuestionario-btn').onclick = () => {
    const preguntas = [];
    const preguntaContainers = document.querySelectorAll('.pregunta-container');

    let formularioValido = true;

    preguntaContainers.forEach((container) => {
        const preguntaId = container.getAttribute('data-index');
        const preguntaText = document.getElementById(`pregunta-${preguntaId}`).value.trim();
        const tipo = document.getElementById(`tipo-${preguntaId}`).value;
        const opciones = [
            {
                texto: document.getElementById(`opcionA-${preguntaId}`).value.trim(),
                correcta: document.getElementById(`correctaA-${preguntaId}`).checked
            },
            {
                texto: document.getElementById(`opcionB-${preguntaId}`).value.trim(),
                correcta: document.getElementById(`correctaB-${preguntaId}`).checked
            },
            {
                texto: document.getElementById(`opcionC-${preguntaId}`).value.trim(),
                correcta: document.getElementById(`correctaC-${preguntaId}`).checked
            },
            {
                texto: document.getElementById(`opcionD-${preguntaId}`).value.trim(),
                correcta: document.getElementById(`correctaD-${preguntaId}`).checked
            }
        ];

        // Validar que el campo de la pregunta no esté vacío
        if (!preguntaText) {
            alert(`La pregunta ${preguntaId} está vacía. Completa el campo de la pregunta.`);
            formularioValido = false;
            return false;
        }

        // Filtrar las opciones vacías
        const opcionesFiltradas = opciones.filter(opcion => opcion.texto);

        // Validar que haya al menos 2 opciones llenas
        if (opcionesFiltradas.length < 2) {
            alert(`La pregunta ${preguntaId} debe tener al menos 2 opciones completas.`);
            formularioValido = false;
            return false;
        }

        // Validar las respuestas correctas para checkbox (mínimo 2, máximo 3 correctas)
        if (tipo === 'checkbox') {
            const respuestasCorrectas = opcionesFiltradas.filter(opcion => opcion.correcta);
            if (respuestasCorrectas.length < 2 || respuestasCorrectas.length > 3) {
                alert(`La pregunta ${preguntaId} debe tener entre 2 y 3 respuestas correctas.`);
                formularioValido = false;
                return false;
            }
        }

        const pregunta = {
            texto: preguntaText,
            tipo: tipo,
            opciones: opcionesFiltradas
        };

        preguntas.push(pregunta);
    });

    if (formularioValido) {
        console.log('Preguntas guardadas:', preguntas);
        alert('Cuestionario guardado en consola (ver consola para detalles)');
    }
};

// Agregar la primera pregunta por defecto
crearPregunta();
