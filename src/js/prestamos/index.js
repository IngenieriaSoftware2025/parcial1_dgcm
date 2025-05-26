console.log('Hola desde prestamos/index.js');

import Swal from "sweetalert2";
import DataTable from "datatables.net-bs5";
import { lenguaje } from "../lenguaje.js";
import { Dropdown } from "bootstrap";

const Formprestamos = document.getElementById("Formprestamos");
const btnGuardar = document.getElementById("btnGuardar");
const btnModificar = document.getElementById("btnModificar");
const btnLimpiar = document.getElementById("btnLimpiar");
const selectLibro = document.getElementById("id_libro");
const selectPersona = document.getElementById("id_persona");
const resumenprestamos = document.getElementById("resumenprestamos");

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

const camposObligatorios = {
    id_libro: 'Debe seleccionar un libro',
    id_persona: 'Debe seleccionar una persona'
};

const validarDatos = formData => {
    const errores = [];
    const datos = Object.fromEntries(formData);
    for (const [campo, msg] of Object.entries(camposObligatorios)) {
        if (!datos[campo] || datos[campo].toString().trim() === '') {
            errores.push(msg);
        }
    }
    return errores;
};

const mostrarAlerta = async (icon, title, text) => {
    return await Swal.fire({ icon, title, text, confirmButtonText: 'Aceptar' });
};

const limpiarFormulario = () => {
    Formprestamos.reset();
};

const tablaDisponibles = new DataTable('#tablaprestamos', {
    language: lenguaje,
    dom: 'Bfrtip',
    columns: [
        {
            title: '#',
            data: 'id_prestamo',
            render: (_, __, ___, meta) => meta.row + 1
        },
        { title: 'Libro', data: 'libro_titulo' },
        { title: 'Lector', data: 'persona_nombres' },
        { title: 'Fecha', data: 'fecha_detalle' },
        {
            title: 'Estado',
            data: 'prestamo',
            render: (data) => {
                return data == 0
                    ? '<span class="badge bg-success">Disponible</span>'
                    : '<span class="badge bg-warning">Prestado</span>';
            }
        },
        {
            title: 'Acciones',
            data: null,
            render: row => `
                <div class="d-flex justify-content-center">
                    <button class="btn btn-success btn-prestar me-2"
                            data-id="${row.id_prestamo}"
                            title="Marcar como prestado">
                        <i class="bi bi-check-circle-fill"></i> Prestar
                    </button>
                    <button class="btn btn-warning btn-editar me-2"
                            data-id="${row.id_prestamo}"
                            title="Editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-danger btn-eliminar"
                            data-id="${row.id_prestamo}"
                            title="Eliminar">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>`
        }
    ]
});

const tablaPrestados = new DataTable('#tablaprestamosDevueltos', {
    language: lenguaje,
    dom: 'Bfrtip',
    columns: [
        {
            title: '#',
            data: 'id_prestamo',
            render: (_, __, ___, meta) => meta.row + 1
        },
        { title: 'Libro', data: 'libro_titulo' },
        { title: 'Lector', data: 'persona_nombres' },
        { title: 'Fecha', data: 'fecha_detalle' },
        {
            title: 'Estado',
            data: 'prestamo',
            render: (data) => {
                return '<span class="badge bg-warning">Prestado</span>';
            }
        },
        {
            title: 'Acciones',
            data: null,
            render: row => `
                <div class="d-flex justify-content-center">
                    <button class="btn btn-secondary btn-devolver me-2"
                            data-id="${row.id_prestamo}"
                            title="Marcar como devuelto">
                        <i class="bi bi-arrow-counterclockwise"></i> Devolver
                    </button>
                    <button class="btn btn-warning btn-editar me-2"
                            data-id="${row.id_prestamo}"
                            title="Editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-danger btn-eliminar"
                            data-id="${row.id_prestamo}"
                            title="Eliminar">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>`
        }
    ]
});

const cargarLibros = async () => {
    try {
        const { libros } = await apiFetch('/parcial1_dgcm/libros/obtenerLibros');
        if (selectLibro) {
            selectLibro.innerHTML = `
                <option value="">Seleccione un libro</option>
                ${libros.map(l => `<option value="${l.id_libro}">${l.titulo}</option>`).join('')}
            `;
        }
    } catch (err) {
        console.error('Error cargando libros:', err);
    }
};

const cargarPersonas = async () => {
    try {
        const { personas } = await apiFetch('/parcial1_dgcm/personas/obtenerPersonas');
        if (selectPersona) {
            selectPersona.innerHTML = `
                <option value="">Seleccione una persona</option>
                ${personas.map(p => `<option value="${p.id_persona}">${p.nombres} ${p.apellidos}</option>`).join('')}
            `;
        }
    } catch (err) {
        console.error('Error cargando personas:', err);
    }
};

const cargarPrestamos = async () => {
    try {
        const { prestamos } = await apiFetch('/parcial1_dgcm/prestamos/obtenerPrestamos');

        // Filtrar disponibles
        const disponibles = prestamos.filter(p => p.prestamo == 0);
        const prestados = prestamos.filter(p => p.prestamo == 1);

        // Cargar datos en las tablas correspondientes
        tablaDisponibles.clear().rows.add(disponibles).draw();
        tablaPrestados.clear().rows.add(prestados).draw();

        if (resumenprestamos) {
            resumenprestamos.textContent = `Total: ${prestamos.length} | Disponibles: ${disponibles.length} | Prestados: ${prestados.length}`;
        }

    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    }
};

const llenarFormulario = async event => {
    const id = event.currentTarget.dataset.id;
    try {
        const { prestamo } = await apiFetch(`/parcial1_dgcm/prestamos/buscarPrestamo?id_prestamo=${id}`);

        document.getElementById('id_prestamo').value = prestamo.id_prestamo || '';
        document.getElementById('id_libro').value = prestamo.id_libro || '';
        document.getElementById('id_persona').value = prestamo.id_persona || '';

        let fechaFormato = '';
        if (prestamo.fecha_detalle) {
            fechaFormato = prestamo.fecha_detalle.substring(0, 16).replace(' ', 'T');
        }
        document.getElementById('fecha_detalle').value = fechaFormato;

        btnGuardar.classList.add('d-none');
        btnModificar.classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        await mostrarAlerta('error', 'Error', 'Error al cargar los datos del préstamo');
    }
};


const guardarPrestamo = async e => {
    e.preventDefault();
    estadoBoton(btnGuardar, true);

    try {
        const formData = new FormData(Formprestamos);
        const errores = validarDatos(formData);

        if (errores.length) {
            await mostrarAlerta('error', 'Error de validación', errores.join('\n'));
            return;
        }

        const { mensaje } = await apiFetch('/parcial1_dgcm/prestamos/guardarPrestamo', {
            method: 'POST',
            body: formData
        });

        await mostrarAlerta('success', 'Éxito', mensaje);
        limpiarFormulario();
        await cargarPrestamos();
    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    } finally {
        estadoBoton(btnGuardar, false);
    }
};

const modificarPrestamo = async e => {
    e.preventDefault();
    estadoBoton(btnModificar, true);

    try {
        const formData = new FormData(Formprestamos);
        const errores = validarDatos(formData);

        if (errores.length) {
            await mostrarAlerta('error', 'Error de validación', errores.join('\n'));
            return;
        }

        const { mensaje } = await apiFetch('/parcial1_dgcm/prestamos/modificarPrestamo', {
            method: 'POST',
            body: formData
        });

        await mostrarAlerta('success', 'Éxito', mensaje);
        limpiarFormulario();
        btnGuardar.classList.remove('d-none');
        btnModificar.classList.add('d-none');
        await cargarPrestamos();
    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    } finally {
        estadoBoton(btnModificar, false);
    }
};

const eliminarPrestamo = async event => {
    const btn = event.currentTarget;
    const id = btn.dataset.id;

    const { isConfirmed } = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar este préstamo?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    const formData = new FormData();
    formData.append('id_prestamo', id);

    try {
        await apiFetch('/parcial1_dgcm/prestamos/eliminarPrestamo', {
            method: 'POST',
            body: formData
        });

        await mostrarAlerta('success', 'Éxito', 'Préstamo eliminado correctamente');
        await cargarPrestamos();
    } catch (err) {
        await mostrarAlerta('error', 'Error', err.message);
    }
};

const prestarLibro = async e => {
    const id = e.currentTarget.dataset.id;
    const { isConfirmed } = await Swal.fire({
        icon: 'question',
        title: 'Marcar como prestado',
        text: '¿Confirmas que este libro fue prestado?',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    });
    if (!isConfirmed) return;

    const fd = new FormData();
    fd.append('id_prestamo', id);

    try {
        await apiFetch('/parcial1_dgcm/prestamos/prestarPrestamo', {
            method: 'POST',
            body: fd
        });
        await mostrarAlerta('success', 'Éxito', 'Libro marcado como prestado');
        await cargarPrestamos();
    } catch (err) {
        await mostrarAlerta('error', 'Error', err.message);
    }
};


const devolverLibro = async e => {
    const id = e.currentTarget.dataset.id;
    const { isConfirmed } = await Swal.fire({
        icon: 'question',
        title: 'Marcar como devuelto',
        text: '¿Confirmas que este libro fue devuelto?',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    });
    if (!isConfirmed) return;

    const fd = new FormData();
    fd.append('id_prestamo', id);

    try {
        await apiFetch('/parcial1_dgcm/prestamos/devolverPrestamo', {
            method: 'POST',
            body: fd
        });
        await mostrarAlerta('success', 'Éxito', 'Libro marcado como devuelto');
        await cargarPrestamos();
    } catch (err) {
        await mostrarAlerta('error', 'Error', err.message);
    }
};


// Eventos 
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await Promise.all([
            cargarLibros(),
            cargarPersonas(),
            cargarPrestamos()
        ]);
    } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        await mostrarAlerta('error', 'Error', 'Error al cargar los datos iniciales');
    }

    if (Formprestamos) {
        Formprestamos.addEventListener('submit', guardarPrestamo);
    }

    if (btnModificar) {
        btnModificar.addEventListener('click', modificarPrestamo);
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            limpiarFormulario();
            if (btnGuardar) btnGuardar.classList.remove('d-none');
            if (btnModificar) btnModificar.classList.add('d-none');
        });
    }

    tablaDisponibles.on('click', '.btn-editar', llenarFormulario);
    tablaDisponibles.on('click', '.btn-eliminar', eliminarPrestamo);
    tablaDisponibles.on('click', '.btn-prestar', prestarLibro);
    tablaDisponibles.on('click', '.btn-devolver', devolverLibro);

    tablaPrestados.on('click', '.btn-editar', llenarFormulario);
    tablaPrestados.on('click', '.btn-eliminar', eliminarPrestamo);
    tablaPrestados.on('click', '.btn-devolver', devolverLibro);
});