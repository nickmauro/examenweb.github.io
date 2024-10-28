// Import Firebase and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAAovxe4C6FdMbd38vDs_bBEhdCFs1DJ3g",
    authDomain: "examcreator-635ab.firebaseapp.com",
    projectId: "examcreator-635ab",
    storageBucket: "examcreator-635ab.appspot.com",
    messagingSenderId: "234754721349",
    appId: "1:234754721349:web:2c93cc00514ac39e83452c",
    measurementId: "G-XVLSN9V38X"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentClassClave = null; // Clave de la clase seleccionada
let currentQuizId = null; // ID del cuestionario actual

// Función para obtener la clase seleccionada
async function obtenerNombreClase(clave) {
    try {
        const clasesRef = collection(db, "clases");
        const claseQuery = query(clasesRef, where("clave", "==", clave));
        const querySnapshot = await getDocs(claseQuery);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                document.getElementById('class-name').textContent = `Clase: ${data.nombre}`;
            });
        } else {
            console.log("No se encontró ninguna clase con esa clave en Firestore.");
        }
    } catch (error) {
        console.error("Error al obtener el nombre de la clase:", error);
    }
}

// Función para cargar los cuestionarios desde Firestore
async function cargarCuestionarios() {
    const quizContainer = document.getElementById('materias-container');
    quizContainer.innerHTML = ''; // Limpiar contenedor

    if (!currentClassClave) {
        console.error("currentClassClave es null o no se ha definido. No se pueden cargar los cuestionarios.");
        return;
    }

    try {
        console.log(`Cargando cuestionarios para la clase con clave: ${currentClassClave}`);

        const cuestionariosRef = collection(db, "cuestionarios");
        const cuestionarioQuery = query(cuestionariosRef, where("claseClave", "==", currentClassClave));

        // Ejecutar la consulta y revisar si obtenemos resultados
        const querySnapshot = await getDocs(cuestionarioQuery);
        if (querySnapshot.empty) {
            console.log(`No se encontraron cuestionarios para la clase con clave: ${currentClassClave}`);
            quizContainer.innerHTML = '<p>No hay cuestionarios para esta clase.</p>';
        } else {
            console.log(`Se encontraron ${querySnapshot.size} cuestionarios.`);
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const quizId = docSnap.id; // Obtener el ID del cuestionario
                const quizClaseClave = data.claseClave; // Guardar la claseClave del cuestionario
                const quizDescripcion = data.descripcion; // Guardar la descripción del cuestionario
                const quizTitulo = data.titulo;

                console.log(`Cargando cuestionario: ${quizTitulo}`);

                const quizElement = document.createElement('div');
                quizElement.className = 'card';
                quizElement.innerHTML = `
                    <h3>${quizTitulo}</h3>
                    <p>${quizDescripcion}</p>
                    <div class="actions">
                        <button class="view-btn" data-claseClave="${quizClaseClave}" data-descripcion="${quizDescripcion}">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="edit-btn" data-id="${quizId}" data-titulo="${quizTitulo}" data-descripcion="${quizDescripcion}">
                            <i class="fas fa-pencil-alt"></i> Editar
                        </button>
                        <button class="delete-btn" data-id="${quizId}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                `;

                quizContainer.appendChild(quizElement);

                // Evento para abrir modal con el cuestionario
                quizElement.querySelector('.view-btn').addEventListener('click', (e) => {
                    const claseClave = e.target.getAttribute('data-claseClave');
                    const descripcion = e.target.getAttribute('data-descripcion');

                    if (!claseClave || !descripcion) {
                        console.error("Clase o descripción no está definida.");
                    } else {
                        abrirModalCuestionarioPorClaveYDescripcion(claseClave, descripcion); // Asegúrate de que los valores no sean nulos
                    }
                    console.log("Clase clave obtenida:", claseClave);
                    console.log("Descripción obtenida:", descripcion);
                });

                // Evento para abrir modal de edición
                quizElement.querySelector('.edit-btn').addEventListener('click', (e) => {
                    const button = e.target.closest('button'); // Obtener el botón editado correctamente
                    const quizId = button.getAttribute('data-id');
                    const titulo = button.getAttribute('data-titulo');
                    const descripcion = button.getAttribute('data-descripcion');
                    abrirModalEdicion(quizId, titulo, descripcion); // Abrir modal con el quizId asignado
                });

                // Evento para eliminar cuestionario
                quizElement.querySelector('.delete-btn').addEventListener('click', async (e) => {
                    const quizId = e.target.getAttribute('data-id');
                    console.log('quizId:', quizId);  // Check if quizId is valid
                    if (quizId) {
                        eliminarCuestionario(quizId);
                    } else {
                        console.error("quizId is null or undefined!");
                    }
                });
            });
        }
    } catch (error) {
        console.error("Error al cargar los cuestionarios:", error);
    }
}

function abrirModalEdicion(quizId, titulo, descripcion) {
    currentQuizId = quizId; // Asignar el quizId al currentQuizId
    const modalEdit = document.getElementById('modal-edit');
    modalEdit.classList.add('show');
    document.getElementById('preguntas-container-edit').innerHTML = ''; // Limpiar contenedor de preguntas

    // Rellenar los campos de edición con los datos actuales
    document.getElementById('edit-titulo').value = titulo;
    document.getElementById('edit-descripcion').value = descripcion;

    // Mostrar las preguntas existentes en el modal de edición
    mostrarPreguntasModalEditable(quizId);

    // Asociar el evento "Agregar Pregunta" al botón en el modal de edición
    document.getElementById('agregar-pregunta-btn').onclick = crearPregunta;

    // Guardar cambios al cuestionario
    document.getElementById('guardar-cuestionario-btn').onclick = async (event) => {
        event.preventDefault();
        if (currentQuizId) {
            console.log("Guardando cambios del cuestionario con ID:", currentQuizId);
            await guardarEdicionCuestionario(currentQuizId);
        } else {
            console.error("Error: currentQuizId no está definido.");
            alert("Error: no se puede guardar el cuestionario. Inténtalo nuevamente.");
        }
    };
}

async function mostrarPreguntasModalEditable(quizId) {
    try {
        console.log(`Cargando preguntas del cuestionario con ID: ${quizId}`);

        const cuestionarioRef = doc(db, "cuestionarios", quizId);
        const cuestionarioSnap = await getDoc(cuestionarioRef);

        if (cuestionarioSnap.exists()) {
            const data = cuestionarioSnap.data();
            const preguntas = data.preguntas || [];

            if (preguntas.length === 0) {
                console.log("No hay preguntas en este cuestionario.");
            } else {
                preguntas.forEach((pregunta, index) => {
                    crearPreguntaDesdeDatos(pregunta, index + 1, true, 'preguntas-container-edit'); // editable es true
                });
            }
        } else {
            console.log("No se encontraron datos para este cuestionario.");
        }
    } catch (error) {
        console.error("Error al cargar las preguntas:", error);
    }
}

// Función para cargar las preguntas de un cuestionario usando claseClave y descripción
async function cargarPreguntasCuestionarioPorClaveYDescripcion(claseClave, descripcion, editable = true, containerId) {
    try {
        console.log("Buscando cuestionario con claseClave:", claseClave, "y descripción:", descripcion);

        const cuestionariosRef = collection(db, "cuestionarios");
        const q = query(cuestionariosRef, where("claseClave", "==", claseClave), where("descripcion", "==", descripcion));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const preguntas = data.preguntas || [];

                if (preguntas.length === 0) {
                    console.log("No hay preguntas en este cuestionario.");
                } else {
                    preguntas.forEach((pregunta, index) => {
                        crearPreguntaDesdeDatos(pregunta, index + 1, editable, containerId); // editable es 'true' o 'false'
                    });
                }
            });
        } else {
            console.log("No se encontraron datos para este cuestionario.");
        }
    } catch (error) {
        console.error("Error al cargar las preguntas:", error);
    }
}

// Función para abrir modal y solo visualizar el cuestionario (sin editar)
async function abrirModalCuestionarioPorClaveYDescripcion(claseClave, descripcion) {
    const modal = document.getElementById('modal-cuestionario');
    modal.classList.add('show');
    document.getElementById('preguntas-container-view').innerHTML = ''; // Limpiar contenedor de preguntas

    // Cargar preguntas guardadas desde Firestore
    await cargarPreguntasCuestionarioPorClaveYDescripcion(claseClave, descripcion, false, 'preguntas-container-view'); // 'false' para solo visualizar
}

function crearPreguntaDesdeDatos(pregunta, index, editable, containerId) {
    const preguntaContainer = document.createElement('div');
    preguntaContainer.classList.add('pregunta-container');
    preguntaContainer.setAttribute('data-index', index);

    let opcionesHtml = '';
    pregunta.opciones.forEach((opcion, idx) => {
        const tipoInput = pregunta.tipo === 'radio' ? 'radio' : 'checkbox';
        opcionesHtml += `
            <label>
                <input type="${tipoInput}" name="correcta-${index}" id="correcta-${index}-${idx}" ${opcion.correcta ? 'checked' : ''} ${editable ? '' : 'disabled'}>
                <input type="text" id="opcion-${index}-${idx}" value="${opcion.texto}" ${editable ? '' : 'disabled'}>
            </label>
        `;
    });

    preguntaContainer.innerHTML = `
        <label for="tipo-${index}">Tipo de Pregunta:</label>
        <select id="tipo-${index}" name="tipo-${index}" ${editable ? '' : 'disabled'}>
            <option value="radio" ${pregunta.tipo === 'radio' ? 'selected' : ''}>Respuesta única (Radio)</option>
            <option value="checkbox" ${pregunta.tipo === 'checkbox' ? 'selected' : ''}>Múltiples respuestas (Checkbox)</option>
        </select>

        <label>Pregunta: <input type="text" id="pregunta-${index}" value="${pregunta.texto}" ${editable ? '' : 'disabled'}></label>
        <div class="opciones-container" id="opciones-container-${index}">
            ${opcionesHtml}
        </div>
    `;

    document.getElementById(containerId).appendChild(preguntaContainer);

    const tipoSelect = document.getElementById(`tipo-${index}`);
    tipoSelect.addEventListener('change', () => cambiarTipoPregunta(index));
}

function crearPregunta(event) {
    event.preventDefault(); // Evita que el formulario se envíe y reinicie la página.

    // Obtener el número de preguntas actuales
    let preguntaIndex = document.querySelectorAll('.pregunta-container').length + 1;

    // Crear un contenedor para la nueva pregunta
    const preguntaContainer = document.createElement('div');
    preguntaContainer.classList.add('pregunta-container');
    preguntaContainer.setAttribute('data-index', preguntaIndex);

    // Crear un botón para eliminar la pregunta
    const eliminarBtn = document.createElement('button');
    eliminarBtn.classList.add('eliminar-pregunta');
    eliminarBtn.textContent = 'X';
    eliminarBtn.onclick = () => {
        preguntaContainer.remove();
    };

    // Estructura HTML para la nueva pregunta
    preguntaContainer.innerHTML = `
        <label for="tipo-${preguntaIndex}">Tipo de Pregunta:</label>
        <select id="tipo-${preguntaIndex}" name="tipo-${preguntaIndex}">
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
    document.getElementById('preguntas-container-edit').appendChild(preguntaContainer);

    // Vincular el evento change al select una vez que está en el DOM
    const tipoSelect = document.getElementById(`tipo-${preguntaIndex}`);
    tipoSelect.addEventListener('change', () => cambiarTipoPregunta(preguntaIndex));
}

// Función para crear las opciones de las preguntas dinámicamente
function crearOpciones(index, tipo) {
    return `
        <label for="opcion-${index}-0">
            <input type="${tipo}" id="correcta-${index}-0" name="correcta-${index}" value="A"> 
            <input type="text" id="opcion-${index}-0" name="opcion-${index}-0" placeholder="Opción A" required>
        </label>
        <label for="opcion-${index}-1">
            <input type="${tipo}" id="correcta-${index}-1" name="correcta-${index}" value="B"> 
            <input type="text" id="opcion-${index}-1" name="opcion-${index}-1" placeholder="Opción B" required>
        </label>
        <label for="opcion-${index}-2">
            <input type="${tipo}" id="correcta-${index}-2" name="correcta-${index}" value="C"> 
            <input type="text" id="opcion-${index}-2" name="opcion-${index}-2" placeholder="Opción C">
        </label>
        <label for="opcion-${index}-3">
            <input type="${tipo}" id="correcta-${index}-3" name="correcta-${index}" value="D"> 
            <input type="text" id="opcion-${index}-3" name="opcion-${index}-3" placeholder="Opción D">
        </label>
    `;
}


// Función para cambiar el tipo de pregunta (radio o checkbox)
function cambiarTipoPregunta(index) {
    const tipo = document.getElementById(`tipo-${index}`).value;
    const opcionesContainer = document.getElementById(`opciones-container-${index}`);

    if (opcionesContainer) { // Verificar si el contenedor de opciones existe
        if (tipo === 'radio') {
            opcionesContainer.innerHTML = crearOpciones(index, "radio");
        } else {
            opcionesContainer.innerHTML = crearOpciones(index, "checkbox");
        }
    } else {
        console.error(`No se encontró el contenedor de opciones para la pregunta con índice ${index}`);
    }
}

// Asignar el evento al botón "Guardar Cuestionario" en el modal de edición
document.getElementById('guardar-cuestionario-btn').onclick = async () => {
    const preguntas = [];
    const preguntaContainers = document.querySelectorAll('.pregunta-container');

    let formularioValido = true;

    // Recorremos cada pregunta agregada o editada
    preguntaContainers.forEach((container) => {
        const preguntaId = container.getAttribute('data-index');
        const preguntaText = document.getElementById(`pregunta-${preguntaId}`)?.value.trim();

        if (!preguntaText) {
            alert(`La pregunta ${preguntaId} está vacía. Completa el campo de la pregunta.`);
            formularioValido = false;
            return;
        }

        const tipo = document.getElementById(`tipo-${preguntaId}`)?.value;

        // Recoger las opciones de respuesta
        const opciones = [
            {
                texto: document.getElementById(`opcionA-${preguntaId}`)?.value.trim(),
                correcta: document.getElementById(`correctaA-${preguntaId}`)?.checked
            },
            {
                texto: document.getElementById(`opcionB-${preguntaId}`)?.value.trim(),
                correcta: document.getElementById(`correctaB-${preguntaId}`)?.checked
            },
            {
                texto: document.getElementById(`opcionC-${preguntaId}`)?.value.trim(),
                correcta: document.getElementById(`correctaC-${preguntaId}`)?.checked
            },
            {
                texto: document.getElementById(`opcionD-${preguntaId}`)?.value.trim(),
                correcta: document.getElementById(`correctaD-${preguntaId}`)?.checked
            }
        ];

        // Filtrar opciones que estén vacías
        const opcionesFiltradas = opciones.filter(opcion => opcion.texto);

        if (opcionesFiltradas.length < 2) {
            alert(`La pregunta ${preguntaId} debe tener al menos 2 opciones completas.`);
            formularioValido = false;
            return;
        }

        // Crear la estructura de la pregunta para guardar
        const pregunta = {
            texto: preguntaText,
            tipo: tipo,
            opciones: opcionesFiltradas
        };

        preguntas.push(pregunta);
    });

    if (formularioValido) {
        // Obtenemos el título y la descripción del cuestionario
        const nuevoTitulo = document.getElementById('edit-titulo').value;
        const nuevaDescripcion = document.getElementById('edit-descripcion').value;

        if (nuevoTitulo && nuevaDescripcion) {
            try {
                const cuestionarioRef = doc(db, "cuestionarios", currentQuizId);
                await updateDoc(cuestionarioRef, {
                    titulo: nuevoTitulo,
                    descripcion: nuevaDescripcion,
                    preguntas // Guardar todas las preguntas
                });
                alert("Cuestionario actualizado exitosamente.");
                document.getElementById('modal-edit').classList.remove('show');
                cargarCuestionarios(); // Recargar cuestionarios actualizados
            } catch (error) {
                console.error("Error al actualizar el cuestionario:", error);
            }
        } else {
            alert("Por favor, completa todos los campos.");
        }
    }

    if (preguntas.length === 0) {
        alert('Por favor, añade al menos una pregunta con opciones válidas.');
    } else {
        // Guardar cuestionario
        await guardarCuestionario(titulo, descripcion, preguntas);
    }

};

// Función para guardar la edición del cuestionario junto con las preguntas
async function guardarEdicionCuestionario(quizId) {
    const nuevoTitulo = document.getElementById('edit-titulo').value;
    const nuevaDescripcion = document.getElementById('edit-descripcion').value;
    const preguntas = obtenerPreguntas(); // Obtener todas las preguntas del DOM

    if (nuevoTitulo && nuevaDescripcion && preguntas.length > 0) {
        try {
            const cuestionarioRef = doc(db, "cuestionarios", quizId);
            await updateDoc(cuestionarioRef, {
                titulo: nuevoTitulo,
                descripcion: nuevaDescripcion,
                preguntas // Guardar todas las preguntas editadas o nuevas
            });
            alert("Cuestionario actualizado exitosamente.");
            document.getElementById('modal-edit').classList.remove('show');
            cargarCuestionarios(); // Recargar cuestionarios actualizados
        } catch (error) {
            console.error("Error al actualizar el cuestionario:", error);
        }
    } else {
        alert("Por favor, completa todos los campos y añade al menos una pregunta.");
    }
}

document.getElementById('guardar-cuestionario-btn').onclick = async (event) => {
    event.preventDefault();  // Prevenir recarga de la página

    if (currentQuizId) {  // Verificar si currentQuizId está definido
        console.log("Guardando cambios del cuestionario con ID:", currentQuizId);
        await guardarEdicionCuestionario(currentQuizId);
    } else {
        console.error("Error: currentQuizId no está definido.");
        alert("Error: no se puede guardar el cuestionario. Inténtalo nuevamente.");
    }
};

// Función para obtener todas las preguntas del DOM (incluyendo tipo y opciones)
function obtenerPreguntas() {
    const preguntas = [];
    const preguntaContainers = document.querySelectorAll('.pregunta-container');

    preguntaContainers.forEach((container) => {
        const preguntaId = container.getAttribute('data-index');
        console.log(`Procesando la pregunta con ID: ${preguntaId}`);

        const preguntaText = document.getElementById(`pregunta-${preguntaId}`)?.value?.trim();
        console.log(`Texto de la pregunta ${preguntaId}: ${preguntaText}`);

        if (preguntaText) {
            const tipo = document.getElementById(`tipo-${preguntaId}`)?.value;
            console.log(`Tipo de la pregunta ${preguntaId}: ${tipo}`);

            const opciones = [];
            for (let i = 0; i < 4; i++) {
                const opcionTexto = document.getElementById(`opcion-${preguntaId}-${i}`)?.value?.trim();
                const esCorrecta = document.getElementById(`correcta-${preguntaId}-${i}`)?.checked;
                console.log(`Opción ${i} de la pregunta ${preguntaId}: texto=${opcionTexto}, correcta=${esCorrecta}`);

                if (opcionTexto) {
                    opciones.push({ texto: opcionTexto, correcta: esCorrecta });
                }
            }

            if (opciones.length >= 2) {
                preguntas.push({
                    texto: preguntaText,
                    tipo: tipo,
                    opciones: opciones
                });
                console.log(`Pregunta añadida: ${preguntaText}, con ${opciones.length} opciones.`);
            } else {
                alert(`La pregunta ${preguntaId} debe tener al menos 2 opciones válidas.`);
            }
        }
    });

    console.log(`Preguntas obtenidas: `, preguntas);
    return preguntas;
}

const preguntas = obtenerPreguntas();
console.log(`Se han capturado ${preguntas.length} preguntas.`);

// Función para guardar un nuevo cuestionario
async function guardarCuestionario(titulo, descripcion, preguntas = []) {
    try {
        const docRef = await addDoc(collection(db, "cuestionarios"), {
            titulo: titulo,
            descripcion: descripcion,
            claseClave: currentClassClave, // Asociar con la clase actual
            preguntas: preguntas, // Se inicializa vacío
            fechaCreacion: new Date()
        });
        console.log("Cuestionario guardado con ID:", docRef.id);
        cargarCuestionarios(); // Recargar lista de cuestionarios
    } catch (e) {
        console.error("Error al guardar el cuestionario: ", e);
    }
}


// Llamada al método para guardar un nuevo cuestionario
document.getElementById('save-btn').onclick = async (event) => {
    event.preventDefault(); // Evitar que el formulario se envíe y recargue la página

    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const preguntas = obtenerPreguntas(); // Obtener preguntas del DOM

    if (titulo && descripcion && preguntas.length > 0) {
        await guardarCuestionario(titulo, descripcion, preguntas);
        document.getElementById('modal').classList.remove('show'); // Cerrar modal
        document.getElementById('form').reset(); // Resetear el formulario
    } else {
        alert("Por favor, completa todos los campos y añade al menos una pregunta.");
    }
};

// Función para eliminar un cuestionario
async function eliminarCuestionario(quizId) {
    if (confirm(`¿Estás seguro de que deseas eliminar este cuestionario?`)) {
        try {
            const cuestionarioRef = doc(db, "cuestionarios", quizId);  // Get the reference using the quizId
            await deleteDoc(cuestionarioRef);  // Delete the document directly
            console.log(`Cuestionario eliminado: ${quizId}`);
            cargarCuestionarios();  // Recargar lista de cuestionarios
        } catch (error) {
            console.error("Error al eliminar el cuestionario:", error);
        }
    }
}

// Función para manejar el evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalCuestionario = document.getElementById('modal-cuestionario');
    const modalEdit = document.getElementById('modal-edit');
    const closeModal = document.querySelector('.close');
    const closeModalEdit = document.querySelector('.close-edit');
    const editCancelBtn = document.getElementById('edit-cancel-btn');
    const closeCuestionario = document.querySelector('.close-cuestionario');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('form');

    // Obtener clave de clase de la URL
    const urlParams = new URLSearchParams(window.location.search);
    currentClassClave = urlParams.get('clave');

    if (currentClassClave) {
        obtenerNombreClase(currentClassClave);
        cargarCuestionarios();
    }

    // Abrir modal para crear nuevo cuestionario
    document.getElementById('new-test-btn').onclick = () => {
        modal.classList.add('show');
        form.reset();
    };

    const loadingIndicator = document.getElementById('loading');
    if (loadingIndicator) {
        console.log("El elemento de carga está presente en el DOM.");
    } else {
        console.warn("El elemento de carga no fue encontrado.");
    }

    closeModal.onclick = () => {
        modal.classList.remove('show');
    };

    closeModalEdit.onclick = () => {
        modalEdit.classList.remove('show');
    };

    editCancelBtn.onclick = () => {
        modalEdit.classList.remove('show');
    };

    closeCuestionario.onclick = () => {
        modalCuestionario.classList.remove('show');
    };

    cancelBtn.onclick = () => {
        modal.classList.remove('show');
        form.reset();
    };

    // Evitar que la página se recargue al agregar una nueva pregunta
    document.getElementById('agregar-pregunta-btn').onclick = (event) => {
        event.preventDefault(); // Prevenir la recarga de la página
        crearPregunta(); // Llamar a la función que agrega una nueva pregunta al formulario
    };

    // Llamada al método para guardar un nuevo cuestionario
    document.getElementById('save-btn').onclick = async (event) => {
        event.preventDefault(); // Evitar que el formulario se envíe y recargue la página

        const titulo = document.getElementById('titulo').value;
        const descripcion = document.getElementById('descripcion').value;

        if (titulo && descripcion) {
            // Solo guardamos título y descripción inicialmente
            await guardarCuestionario(titulo, descripcion, []);
            document.getElementById('modal').classList.remove('show'); // Cerrar modal
            document.getElementById('form').reset(); // Resetear el formulario
        } else {
            alert("Por favor, completa todos los campos.");
        }
    };

});
