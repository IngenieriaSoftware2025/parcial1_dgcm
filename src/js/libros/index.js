console.log('Hola desde libros/index.js');

import Swal from "sweetalert2";
import DataTable from "datatables.net-bs5";
import { lenguaje } from "../lenguaje.js";
import { Dropdown } from 'bootstrap'; 

const FormLibros = document.getElementById("FormLibros");
const btnGuardar = document.getElementById("btnGuardar");
const btnModificar = document.getElementById("btnModificar");
const btnLimpiar = document.getElementById("btnLimpiar");

// Helpers 
const estadoBoton = (btn, disabled) => {
    if (btn) {
        btn.disabled = disabled;
    }
}

const apiFetch = async (url, { method = 'GET', body = null } = {}) => {
    const resp = await fetch(url, {
        method,
        body,
        headers: { 'Accept': 'application/json' }
    });

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

// Reglas
const camposObligatorios = {
    titulo: 'El Titulo del libro es obligatorio',
    autor: 'El autor del libro es obligatorio',
};

const reglasEspecificas = {
    titulo: {
        evaluar: v => v.length >= 3 && v.length <= 100,
        msg: 'El Titulo debe tener entre 3 y 100 caracteres'
    },
    autor: {
        evaluar: v => v.length >= 3 && v.length <= 100,
        msg: 'El autor debe tener entre 3 y 100 caracteres'
    }
};

const validarDatos = (formData) => {
    const errores = [];
    const datos = Object.fromEntries(formData);
    console.log('Datos a validar:', datos);

    for (const [campo, mensaje] of Object.entries(camposObligatorios)) {
        if (!datos[campo] || datos[campo].trim() === '') {
            errores.push(mensaje);
        }
    }

    for (const [campo, regla] of Object.entries(reglasEspecificas)) {
        if (datos[campo] && !regla.evaluar(datos[campo])) {
            errores.push(regla.msg);
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
}

const limpiarFormulario = () => {
    FormLibros.reset();
}

const guardarLibro = async (e) => {
    e.preventDefault();
    estadoBoton(btnGuardar, true);

    try {
        const formData = new FormData(FormLibros);
        const errores = validarDatos(formData);

        if (errores.length) {
            await mostrarAlerta('error', 'Error de validación', errores.join('\n'));
            return;
        }

        const data = await apiFetch('/parcial1_dgcm/libros/guardarLibro', {
            method: 'POST',
            body: formData
        });

        await mostrarAlerta('success', 'Éxito', data.mensaje);
        limpiarFormulario();
        await cargarLibros();

    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    } finally {
        estadoBoton(btnGuardar, false);
    }
};

const tablaLibros = new DataTable('#tablaLibros', {
    language: lenguaje,
    dom: 'Bfrtip',
    columns: [
        {
            title: '#',
            data: 'id_libro',
            render: (data, type, row, meta) => meta.row + 1
        },
        { title: 'Nombre', data: 'titulo' },
        { title: 'Autor', data: 'autor' },
        {
            title: 'Acciones',
            data: null,
            render: (data, type, row) => `
                <div class="d-flex justify-content-center">
                    <button class="btn btn-warning btn-editar me-2" data-id="${row.id_libro}">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-danger btn-eliminar" data-id="${row.id_libro}">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            `
        }
    ]
});

const cargarLibros = async () => {
    try {
        const { libros } = await apiFetch('/parcial1_dgcm/libros/obtenerLibros');
        tablaLibros.clear().rows.add(libros).draw();

        if (!libros.length) {
            await mostrarAlerta('info', 'Información', 'No hay libros registradas');
        }

    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    }
};

const llenarFormulario = async (event) => {
    const id = event.currentTarget.dataset.id;   

    try {
        const { libro } = await apiFetch(
            `/parcial1_dgcm/libros/buscarLibro?id_libro=${id}`
        );

        ['id_libro', 'titulo', 'autor']
            .forEach(campo => {
                const input = document.getElementById(campo);
                if (input) input.value = libro[campo] ?? '';
            });

        btnGuardar.classList.add('d-none');
        btnModificar.classList.remove('d-none');

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    }
};

const modificarLibro = async (e) => {
    e.preventDefault();
    estadoBoton(btnModificar, true);    

    try {
        const formData = new FormData(FormLibros);
        const errores = validarDatos(formData);

        if (errores.length) {
            await mostrarAlerta('error', 'Error de validación', errores.join('\n'));
            return;
        }

        const data = await apiFetch('/parcial1_dgcm/libros/modificarLibro', {
            method: 'POST',
            body: formData
        });

        await mostrarAlerta('success', 'Éxito', data.mensaje);
        limpiarFormulario();
        await cargarLibros();

        btnGuardar.classList.remove('d-none');
        btnModificar.classList.add('d-none');

    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    } finally {
        estadoBoton(btnModificar, false);   
    }
};

const eliminarLibro = async (event) => {
    const btn = event.currentTarget;
    const id = btn.dataset.id;
    const row = tablaLibros.row(btn.closest('tr')).data();  
    const titulo = `${row.titulo}`;

    const { isConfirmed } = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        html: `Esta acción eliminará el libro:<br><strong>${titulo}</strong>`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
    });

    if (!isConfirmed) return;

    const formData = new FormData();
    formData.append('id_libro', id);

    try {
        await apiFetch('/parcial1_dgcm/libros/eliminarLibro', {
            method: 'POST',
            body: formData
        });

        await mostrarAlerta('success', 'Éxito', 'Libro eliminada correctamente');
        await cargarLibros();  

    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    }
};

tablaLibros.on('click', '.btn-editar', llenarFormulario);
tablaLibros.on('click', '.btn-eliminar', eliminarLibro);
btnModificar.addEventListener('click', modificarLibro);
FormLibros.addEventListener('submit', guardarLibro);
btnLimpiar.addEventListener('click', () => {
    FormLibros.reset();
    btnGuardar.classList.remove('d-none');
    btnModificar.classList.add('d-none');
});

document.addEventListener('DOMContentLoaded', cargarLibros);