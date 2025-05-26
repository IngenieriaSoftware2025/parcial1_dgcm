console.log('Hola desde prestamos/index.js');

import Swal from "sweetalert2";
import DataTable from "datatables.net-bs5";
import { lenguaje } from "../lenguaje.js";
import { Dropdown } from 'bootstrap';

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

// Reglas de validación
const camposObligatorios = {
    id_libro: 'Debe seleccionar una libro',
    id_persona: 'Debe seleccionar unaa persona'
};


const validarDatos = formData => {
    const errores = [];
    const datos = Object.fromEntries(formData);
    // Obligatorios
    for (const [campo, msg] of Object.entries(camposObligatorios)) {
        if (!datos[campo] || datos[campo].toString().trim() === '') {
            errores.push(msg);
        }
    }
    // Específicas
    for (const [campo, regla] of Object.entries(reglasEspecificas)) {
        if (datos[campo] && !regla.evaluar(datos[campo])) {
            errores.push(regla.msg);
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

// DataTables
const tablaactivos = new DataTable('#tablaprestamos', {
    language: lenguaje,
    dom: 'Bfrtip',

    rowGroup: {
        dataSrc: 'categoria_nombre'
    },

    order: [
        [3, 'asc'],
        [4, 'desc']
    ],

    columnDefs: [
        {
            targets: 4,
            render: (data, type) => {
                let clase;
                switch (data) {
                    case 'Alta': clase = 'bg-danger text-white'; break;
                    case 'Media': clase = 'bg-warning text-dark'; break;
                    case 'Baja': clase = 'bg-success text-white'; break;
                    default: clase = 'bg-secondary text-white';
                }
                return `<span class="badge ${clase}">${data}</span>`;
            }
        }
    ],

    columns: [
        {
            title: '#',
            data: 'id_prestamo',
            render: (_, __, ___, meta) => meta.row + 1
        },
        { title: 'Producto', data: 'nombre' },
        { title: 'Cantidad', data: 'cantidad' },
        { title: 'Categoría', data: 'categoria_nombre' },
        { title: 'Prioridad', data: 'prioridad_nombre' },
        { title: 'Cliente', data: 'cliente_nombre' },
        {
            title: 'Acciones',
            data: null,
            render: row => `
        <div class="d-flex justify-content-center">
          <button class="btn btn-success btn-comprar me-2"
                  data-id="${row.id_prestamo}"
                  title="Marcar comprado">
            <i class="bi bi-check-circle-fill"></i>
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

const tablaComprados = new DataTable('#tablaprestamosComprados', {
    language: lenguaje,
    dom: 'Bfrtip',

    rowGroup: {
        dataSrc: 'categoria_nombre'
    },

    order: [
        [3, 'asc'],
        [4, 'desc']
    ],

    columnDefs: [
        {
            targets: 4, 
            render: (data, type) => {
                let clase;
                switch (data) {
                    case 'Alta': clase = 'bg-danger text-white'; break;
                    case 'Media': clase = 'bg-warning text-dark'; break;
                    case 'Baja': clase = 'bg-success text-white'; break;
                    default: clase = 'bg-secondary text-white';
                }
                return `<span class="badge ${clase}">${data}</span>`;
            }
        }
    ],

    columns: [
        {
            title: '#',
            data: 'id_prestamo',
            render: (_, __, ___, meta) => meta.row + 1
        },
        { title: 'Producto', data: 'nombre' },
        { title: 'Cantidad', data: 'cantidad' },
        { title: 'Categoría', data: 'categoria_nombre' },
        { title: 'Prioridad', data: 'prioridad_nombre' },
        { title: 'Cliente', data: 'cliente_nombre' },
        {
            title: 'Acciones',
            data: null,
            render: row => `
        <div class="d-flex justify-content-center">
          <button class="btn btn-secondary btn-pendiente me-2"
                  data-id="${row.id_prestamo}"
                  title="Marcar como pendiente">
            <i class="bi bi-arrow-counterclockwise"></i>
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


// Carga de selects
const cargarCategorias = async () => {
    const { categorias } = await apiFetch('/parcial1_dgcm/categorias/obtenerCategorias');
    selectLibro.innerHTML = `
        <option value="">Seleccione una categoría</option>
        ${categorias.map(c => `<option value="${c.id_libro}">${c.nombre}</option>`).join('')}
    `;
};

const cargarLibros = async () => {
    const { prioridades } = await apiFetch('/parcial1_dgcm/prioridades/obtenerLibros');
    selectPersona.innerHTML = `
        <option value="">Seleccione una prioridad</option>
        ${prioridades.map(p => `<option value="${p.id_libro}">${p.nombre}</option>`).join('')}
    `;
};

const cargarPersonas = async () => {
    const { clientes } = await apiFetch('/parcial1_dgcm/clientes/obtenerPersonas');
    document.getElementById('id_persona').innerHTML = `
    <option value="">Seleccione un cliente</option>
    ${clientes.map(c => `<option value="${c.id_persona}">${c.nombres} ${c.apellidos}</option>`).join('')}
  `;
};

let prestamosactivos = [], prestamosComprados = [];

const cargarprestamos = async () => {
    const { prestamos } = await apiFetch('/parcial1_dgcm/prestamos/obtenerPrestamos');
    prestamosactivos = prestamos.filter(p => p.comprado == 0);
    prestamosComprados = prestamos.filter(p => p.comprado == 1);

    tablaactivos.clear().rows.add(prestamosactivos).draw();
    tablaComprados.clear().rows.add(prestamosComprados).draw();

    resumenprestamos.textContent = `
        activos: ${prestamosactivos.length} —
        Comprados: ${prestamosComprados.length}
    `;
};

// Llenar formulario para editar
const llenarFormulario = async event => {
    const id = event.currentTarget.dataset.id;
    const { producto } = await apiFetch(
        `/parcial1_dgcm/prestamos/buscarPrestamo?id_prestamo=${id}`
    );
    ['id_prestamo', 'nombre', 'cantidad', 'id_libro', 'id_libro', 'id_persona']
        .forEach(f => document.getElementById(f).value = producto[f] ?? '');

    btnGuardar.classList.add('d-none');
    btnModificar.classList.remove('d-none');

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Guardar producto
const guardarPrestamo = async e => {
    e.preventDefault();
    estadoBoton(btnGuardar, true);

    try {
        const formData = new FormData(Formprestamos);
        const errores = validarDatos(formData);

        const datos = Object.fromEntries(formData);
        const nombreLower = datos.nombre.trim().toLowerCase();
        const catId = datos.id_libro;
        const cliId = datos.id_persona;

        if (prestamosactivos.some(p =>
            p.nombre.toLowerCase() === nombreLower &&
            String(p.id_libro) === catId &&
            String(p.id_persona) === cliId
        )) {
            await mostrarAlerta('error', 'Duplicado', 'Ya agregaste este producto en esa categoría para este cliente.');
            return;
        }

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
        await cargarprestamos();
    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    } finally {
        estadoBoton(btnGuardar, false);
    }
};


// Modificar producto
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
        await cargarprestamos();
    } catch (err) {
        console.error(err);
        await mostrarAlerta('error', 'Error', err.message);
    } finally {
        estadoBoton(btnModificar, false);
    }
};

// Eliminar o marcar comprado
const eliminarPrestamo = async event => {
    const btn = event.currentTarget;
    const id = btn.dataset.id;
    const fila = btn.closest('table').id === 'tablaprestamos'
        ? tablaactivos.row(btn.closest('tr')).data()
        : tablaComprados.row(btn.closest('tr')).data();

    const texto = fila.comprado == 0
        ? `marcar como comprado: "${fila.nombre}"?`
        : `eliminar definitivamente: "${fila.nombre}"?`;

    const { isConfirmed } = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        html: `¿Deseas ${texto}`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    const formData = new FormData();
    formData.append('id_prestamo', id);

    await apiFetch('/parcial1_dgcm/prestamos/eliminarPrestamo', {
        method: 'POST',
        body: formData
    });

    await mostrarAlerta('success', 'Éxito',
        fila.comprado == 0
            ? 'Producto marcado como comprado'
            : 'Producto eliminado correctamente'
    );
    await cargarprestamos();
};


const comprarProducto = async e => {
    const id = e.currentTarget.dataset.id;
    const { isConfirmed } = await Swal.fire({
        icon: 'question',
        title: 'Marcar como comprado',
        text: '¿Confirmas que ya compraste este producto?',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    });
    if (!isConfirmed) return;

    const fd = new FormData();
    fd.append('id_prestamo', id);
    fd.append('comprado', 1);

    await apiFetch('/parcial1_dgcm/prestamos/modificarPrestamo', {
        method: 'POST',
        body: fd
    });
    await mostrarAlerta('success', 'Éxito', 'Producto marcado como comprado');
    await cargarprestamos();
};

const revertirApendiente = async e => {
    const id = e.currentTarget.dataset.id;
    const { isConfirmed } = await Swal.fire({
        icon: 'question',
        title: 'Marcar como pendiente',
        text: '¿Quieres devolver este producto a activos?',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    });
    if (!isConfirmed) return;

    const fd = new FormData();
    fd.append('id_prestamo', id);
    fd.append('comprado', 0);

    await apiFetch('/parcial1_dgcm/prestamos/modificarPrestamo', {
        method: 'POST',
        body: fd
    });
    await mostrarAlerta('success', 'Éxito', 'Producto marcado como pendiente');
    await cargarprestamos();
};



// Eventos
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        cargarCategorias(),
        cargarLibros(),
        cargarPersonas(),
        cargarprestamos()
    ]);
    Formprestamos.addEventListener('submit', guardarPrestamo);
    btnModificar.addEventListener('click', modificarPrestamo);
    btnLimpiar.addEventListener('click', () => {
        limpiarFormulario();
        btnGuardar.classList.remove('d-none');
        btnModificar.classList.add('d-none');
    });
    tablaactivos.on('click', '.btn-editar', llenarFormulario);
    tablaactivos.on('click', '.btn-eliminar', eliminarPrestamo);
    tablaComprados.on('click', '.btn-eliminar', eliminarPrestamo);

    tablaactivos.on('click', '.btn-comprar', comprarProducto);
    tablaComprados.on('click', '.btn-pendiente', revertirApendiente);


});
