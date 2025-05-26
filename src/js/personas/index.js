console.log('Hola desde personas/index.js');

import Swal from "sweetalert2";
import DataTable from "datatables.net-bs5";
import { lenguaje } from "../lenguaje.js";

const FormPersonas = document.getElementById("FormPersonas");
const btnGuardar = document.getElementById("btnGuardar");
const btnModificar = document.getElementById("btnModificar");
const btnLimpiar = document.getElementById("btnLimpiar");

// Helpers
const estadoBoton = (btn, disabled) => {
    if (btn) btn.disabled = disabled;
};

const apiFetch = async (url, { method = 'GET', body = null } = {}) => {
    const resp = await fetch(url, { method, body, headers: { 'Accept': 'application/json' } });
    const raw = await resp.text();
    if (!raw.trim()) throw new Error('Respuesta vacía del servidor');
    let data;
    try { data = JSON.parse(raw); }
    catch { throw new Error('La respuesta no es JSON válido'); }
    if (data.tipo !== 'success') {
        const msg = data.mensaje || 'Error desconocido';
        throw new Error(msg);
    }
    return data;
};

// Reglas de validación
const camposObligatorios = {
    nombres: 'El nombre es obligatorio',
    apellidos: 'El apellido es obligatorio'
};

const validarDatos = (formData) => {
    const errores = [];
    const datos = Object.fromEntries(formData);
    
    for (const [campo, mensaje] of Object.entries(camposObligatorios)) {
        if (!datos[campo] || datos[campo].trim() === '') {
            errores.push(mensaje);
        }
    }
    return errores;
};

const mostrarAlerta = async (tipo, titulo, mensaje) => {
    return await Swal.fire({
        icon: tipo,
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar'
    });
};

const limpiarFormulario = () => {
    FormPersonas.reset();
};

// Crear la tabla de personas
const tablaPersonas = new DataTable('#tablaPersonas', {
    language: lenguaje,
    dom: 'Bfrtip',
    columns: [
        {
            title: '#',
            data: 'id_persona',
            render: (data, type, row, meta) => meta.row + 1
        },
        { title: 'Nombres', data: 'nombres' },
        { title: 'Apellidos', data: 'apellidos' },
        {
            title: 'Acciones',
            data: null,
            render: (data, type, row) => `
                <div class="d-flex justify-content-center">
                    <button class="btn btn-warning btn-editar me-2" data-id="${row.id_persona}">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-danger btn-eliminar" data-id="${row.id_persona}">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            `
        }
    ]
});

const cargarPersonas = async () => {
    try {
        const { personas } = await apiFetch('/parcial1_dgcm/personas/obtenerPersonas');
        tablaPersonas.clear().rows.add(personas).draw();

        if (!personas.length) {
            await mostrarAlerta('info', 'Información', 'No hay personas registradas');
        }

    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    }
};

const llenarFormulario = async (event) => {
    const id = event.currentTarget.dataset.id;   

    try {
        const { persona } = await apiFetch(`/parcial1_dgcm/personas/buscarPersona?id_persona=${id}`);

        document.getElementById('id_persona').value = persona.id_persona || '';
        document.getElementById('nombres').value = persona.nombres || '';
        document.getElementById('apellidos').value = persona.apellidos || '';

        btnGuardar.classList.add('d-none');
        btnModificar.classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    }
};

const guardarPersona = async (e) => {
    e.preventDefault();
    estadoBoton(btnGuardar, true);

    try {
        const formData = new FormData(FormPersonas);
        const errores = validarDatos(formData);

        if (errores.length) {
            await mostrarAlerta('error', 'Error de validación', errores.join('\n'));
            return;
        }

        const data = await apiFetch('/parcial1_dgcm/personas/guardarPersona', {
            method: 'POST',
            body: formData
        });

        await mostrarAlerta('success', 'Éxito', data.mensaje);
        limpiarFormulario();
        await cargarPersonas();

    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    } finally {
        estadoBoton(btnGuardar, false);
    }
};

const modificarPersona = async (e) => {
    e.preventDefault();
    estadoBoton(btnModificar, true);    

    try {
        const formData = new FormData(FormPersonas);
        const errores = validarDatos(formData);

        if (errores.length) {
            await mostrarAlerta('error', 'Error de validación', errores.join('\n'));
            return;
        }

        const data = await apiFetch('/parcial1_dgcm/personas/modificarPersona', {
            method: 'POST',
            body: formData
        });

        await mostrarAlerta('success', 'Éxito', data.mensaje);
        limpiarFormulario();
        await cargarPersonas();

        btnGuardar.classList.remove('d-none');
        btnModificar.classList.add('d-none');

    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    } finally {
        estadoBoton(btnModificar, false);   
    }
};

const eliminarPersona = async (event) => {
    const btn = event.currentTarget;
    const id = btn.dataset.id;
    const row = tablaPersonas.row(btn.closest('tr')).data();  
    const nombre = `${row.nombres} ${row.apellidos}`;

    const { isConfirmed } = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        html: `Esta acción eliminará a:<br><strong>${nombre}</strong>`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
    });

    if (!isConfirmed) return;

    const formData = new FormData();
    formData.append('id_persona', id);

    try {
        await apiFetch('/parcial1_dgcm/personas/eliminarPersona', {
            method: 'POST',
            body: formData
        });

        await mostrarAlerta('success', 'Éxito', 'Persona eliminada correctamente');
        await cargarPersonas();  

    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    }
};

// Eventos
tablaPersonas.on('click', '.btn-editar', llenarFormulario);
tablaPersonas.on('click', '.btn-eliminar', eliminarPersona);

if (FormPersonas) {
    FormPersonas.addEventListener('submit', guardarPersona);
}

if (btnModificar) {
    btnModificar.addEventListener('click', modificarPersona);
}

if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
        limpiarFormulario();
        btnGuardar.classList.remove('d-none');
        btnModificar.classList.add('d-none');
    });
}

document.addEventListener('DOMContentLoaded', cargarPersonas);