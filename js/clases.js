// Import Firebase and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

let editingClave = null; // Para almacenar el ID del documento de la clase que se está editando

// Función para agregar clases dinámicas a la interfaz (se añade cada clase a la página)
// Función para agregar clases dinámicas a la interfaz (clases.html)
function agregarMateria(nombre, clave, grupo, status, id) {
    const materiasContainer = document.getElementById('materias-container');
    const card = document.createElement('div');
    card.className = 'card';
    
    // Agregar atributo data-id para identificar el documento en Firestore
    card.setAttribute('data-id', id);
    
    card.innerHTML = `
        <h3>${nombre}</h3>
        <p>Clave: ${clave}</p>
        <p>Grupo: ${grupo}</p>
        <p><span class="status">${status}</span></p>
        <div class="actions">
            <button class="edit-btn"><i class="fas fa-pencil-alt"></i></button>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    materiasContainer.appendChild(card);

    // Evento click para redirigir a la página de cuestionarios
    card.addEventListener('click', () => {
        // Redirigir a la página cuestionario.html con la clave de la clase como parámetro en la URL
        window.location.href = `cuestionario.html?clave=${clave}`;
    });

    // Agregar eventos a los botones
    card.querySelector('.edit-btn').addEventListener('click', () => {
        abrirModalEdicion(nombre, clave, grupo, id);
    });

    card.querySelector('.delete-btn').addEventListener('click', () => {
        eliminarClase(id); // Usar el ID del documento para eliminar
    });
}

// Función para abrir el modal de edición con los datos de la clase
function abrirModalEdicion(nombre, clave, grupo, id) {
    editingClave = id; // Guardamos el ID del documento que se está editando
    const modalEdit = document.getElementById('modal-edit');
    modalEdit.style.display = 'block';

    // Rellenar el formulario con los datos de la clase
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-clave').value = clave;
    document.getElementById('edit-grupo').value = grupo;
}

// Función para guardar una clase en Firestore
async function guardarClase(nombre, clave, grupo) {
    try {
        const docRef = await addDoc(collection(db, "clases"), {
            nombre: nombre,
            clave: clave,
            grupo: grupo,
            fechaCreacion: new Date(),
        });
        console.log("Clase guardada exitosamente", docRef.id);
        agregarMateria(nombre, clave, grupo, "Setup in Progress", docRef.id); // Pasar el ID del documento
    } catch (e) {
        console.error("Error al guardar la clase: ", e);
        alert("Error al guardar la clase.");
    }
}

// Función para cargar las clases desde Firestore
async function cargarClases() {
    try {
        const querySnapshot = await getDocs(collection(db, "clases"));
        if (querySnapshot.empty) {
            console.log("No se encontraron clases.");
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id; // Obtener el ID del documento
            agregarMateria(data.nombre, data.clave, data.grupo, "Setup in Progress", id);  // Pasar el ID del documento
        });
    } catch (e) {
        console.error("Error al cargar las clases: ", e);
    }
}

// Función para eliminar una clase
async function eliminarClase(id) {
    if (confirm(`¿Estás seguro de que deseas eliminar esta clase?`)) {
        try {
            const claseRef = doc(db, "clases", id);
            await deleteDoc(claseRef);
            console.log(`Clase con ID ${id} eliminada.`);

            // Eliminar el elemento de la interfaz
            const cardToRemove = document.querySelector(`[data-id="${id}"]`);
            if (cardToRemove) {
                cardToRemove.remove();
            }
        } catch (e) {
            console.error("Error al eliminar la clase: ", e);
        }
    }
}

// Evento que se ejecuta cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalEdit = document.getElementById('modal-edit');
    const closeModal = document.querySelector('.close');
    const closeModalEdit = document.querySelector('.close-edit');
    const saveBtn = document.getElementById('save-btn');
    const editSaveBtn = document.getElementById('edit-save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const editCancelBtn = document.getElementById('edit-cancel-btn');
    const form = document.getElementById('form');
    const editForm = document.getElementById('edit-form');
    const toggleBtn = document.getElementById('toggle-btn');

    document.getElementById('new-test-btn').onclick = () => {
        modal.style.display = 'block';
        form.reset(); // Limpiamos el formulario
    };

    closeModal.onclick = () => {
        modal.style.display = 'none';
    };

    closeModalEdit.onclick = () => {
        modalEdit.style.display = 'none';
    };

    cancelBtn.onclick = () => {
        modal.style.display = 'none';
        form.reset();
    };

    editCancelBtn.onclick = () => {
        modalEdit.style.display = 'none';
        editForm.reset();
    };

    // Guardar la nueva clase
    saveBtn.onclick = async () => {
        const nombre = document.getElementById('nombre').value;
        const clave = document.getElementById('clave').value;
        const grupo = document.getElementById('grupo').value;

        if (nombre && clave && grupo) {
            try {
                await guardarClase(nombre, clave, grupo);
                modal.style.display = 'none';
                form.reset();
            } catch (error) {
                console.error("Error al guardar la clase: ", error);
            }
        } else {
            alert('Por favor, completa todos los campos.');
        }
    };

    // Guardar cambios en la clase editada
    // Guardar cambios en la clase editada
    editSaveBtn.onclick = async () => {
        const nombre = document.getElementById('edit-nombre').value;
        const clave = document.getElementById('edit-clave').value;
        const grupo = document.getElementById('edit-grupo').value;

        if (nombre && clave && grupo) {
            try {
                const claseRef = doc(db, "clases", editingClave);
                await updateDoc(claseRef, {
                    nombre: nombre,
                    clave: clave,
                    grupo: grupo
                });
                console.log(`Clase actualizada: ${nombre}`);

                // Actualizar la tarjeta en el DOM
                const cardToUpdate = document.querySelector(`[data-id="${editingClave}"]`);
                if (cardToUpdate) {
                    cardToUpdate.querySelector('h3').textContent = nombre;
                    cardToUpdate.querySelector('p:nth-child(2)').textContent = `Clave: ${clave}`;
                    cardToUpdate.querySelector('p:nth-child(3)').textContent = `Grupo: ${grupo}`;
                }

                modalEdit.style.display = 'none';
                editForm.reset();
            } catch (error) {
                console.error("Error al actualizar la clase: ", error);
            }
        } else {
            alert('Por favor, completa todos los campos.');
        }
    };


    cargarClases();

    toggleBtn.onclick = () => {
        document.body.classList.toggle('hide-sidebar');
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == modalEdit) {
            modalEdit.style.display = 'none';
        }
    };
});
