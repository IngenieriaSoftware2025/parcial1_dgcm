import Swal from 'sweetalert2';
export const validarFormulario = (formulario, excepciones = []) => {
    const elements = formulario.querySelectorAll("input, select, textarea");
    let validarFormulario = []
    elements.forEach(element => {
        if (!element.value.trim() && !excepciones.includes(element.id)) {
            element.classList.add('is-invalid');

            validarFormulario.push(false)
        } else {
            element.classList.remove('is-invalid');
        }
    });

    let noenviar = validarFormulario.includes(false);

    return !noenviar;
}

export const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})


// MIASSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS

// src/js/funciones.js
import Swal from "sweetalert2";
import DataTable from "datatables.net-bs5";
import { lenguaje } from "./lenguaje.js";


//   Llama al fetch y convierte la respuesta a JSON validado.

export async function apiFetch(url, { method = 'GET', body = null } = {}) {
    const resp = await fetch(url, {
        method,
        body,
        headers: { Accept: "application/json" }
    });
    const raw = await resp.text();
    if (!raw.trim()) throw new Error("Respuesta vacía del servidor");
    let data;
    try {
        data = JSON.parse(raw);
    } catch {
        throw new Error("La respuesta no es JSON válido");
    }
    if (data.tipo !== "success") {
        throw new Error(data.mensaje || "Error desconocido");
    }
    return data;
}


//  Muestra un SweetAlert genérico.

export function mostrarAlerta(icon, title, text) {
    return Swal.fire({ icon, title, text, confirmButtonText: "Aceptar" });
}

//  Habilita o deshabilita un botón.
 
export function estadoBoton(btn, disabled) {
    if (btn) btn.disabled = disabled;
}

/**
 * Inicializa un CRUD genérico:
 *   • entity: nombre de la ruta y clave en JSON (“categorias”, “prioridades”, etc.)
 *   • formSelector: selector del <form> (ej. "#FormCategorias")
 *   • tableSelector: selector de la tabla DataTable
 *   • columns: configuración de columnas para DataTable
 *   • validate: función (FormData → Array de errores)
 *   • fields: lista de campos que envía el formulario y recibe del servidor
 */
export function initCRUD({
    entity,
    formSelector,
    tableSelector,
    columns,
    validate,
    fields
}) {
    const Form = document.querySelector(formSelector);
    const btnGuardar = Form.querySelector("[data-action=guardar]");
    const btnModificar = Form.querySelector("[data-action=modificar]");
    const btnLimpiar = Form.querySelector("[data-action=limpiar]");
    const tabla = new DataTable(tableSelector, {
        language: lenguaje,
        dom: "Bfrtip",
        columns
    });

    let lista = [];

    async function cargar() {
        try {
            const { [entity]: items } = await apiFetch(
                `/parcial1_dgcm/${entity}/obtener${capitalize(entity)}`
            );
            lista = items;
            tabla.clear().rows.add(lista).draw();
            if (!lista.length) {
                await mostrarAlerta("info", "Información", `No hay ${entity} registrados`);
            }
        } catch (e) {
            console.error(e);
            await mostrarAlerta("error", "Error", e.message);
        }
    }

    function resetForm() {
        Form.reset();
        btnGuardar.classList.remove("d-none");
        btnModificar.classList.add("d-none");
    }

    // Crear
    Form.addEventListener("submit", async e => {
        e.preventDefault();
        estadoBoton(btnGuardar, true);
        const formData = new FormData(Form);
        const errores = validate(formData);
        if (errores.length) {
            await mostrarAlerta("error", "Validación", errores.join("\n"));
            estadoBoton(btnGuardar, false);
            return;
        }
        try {
            const data = await apiFetch(
                `/parcial1_dgcm/${entity}/guardar${capitalize(entity)}`,
                { method: "POST", body: formData }
            );
            await mostrarAlerta("success", "Éxito", data.mensaje);
            resetForm();
            await cargar();
        } catch (err) {
            console.error(err);
            await mostrarAlerta("error", "Error", err.message);
        } finally {
            estadoBoton(btnGuardar, false);
        }
    });

    // Modificar
    btnModificar.addEventListener("click", async e => {
        e.preventDefault();
        estadoBoton(btnModificar, true);
        const formData = new FormData(Form);
        const errores = validate(formData);
        if (errores.length) {
            await mostrarAlerta("error", "Validación", errores.join("\n"));
            estadoBoton(btnModificar, false);
            return;
        }
        try {
            const data = await apiFetch(
                `/parcial1_dgcm/${entity}/modificar${capitalize(entity)}`,
                { method: "POST", body: formData }
            );
            await mostrarAlerta("success", "Éxito", data.mensaje);
            resetForm();
            await cargar();
        } catch (err) {
            console.error(err);
            await mostrarAlerta("error", "Error", err.message);
        } finally {
            estadoBoton(btnModificar, false);
        }
    });

    // Limpiar
    btnLimpiar.addEventListener("click", resetForm);

    // Editar desde la tabla
    tabla.on("click", ".btn-editar", async ev => {
        const id = ev.currentTarget.dataset.id;
        try {
            const { [entity.slice(0, -1)]: item } = await apiFetch(
                `/parcial1_dgcm/${entity}/buscar${capitalize(entity.slice(0, -1))}?` +
                `id_${entity.slice(0, -1)}=${id}`
            );
            fields.forEach(f => {
                const inp = Form.querySelector(`[name=${f}]`);
                if (inp) inp.value = item[f] ?? "";
            });
            btnGuardar.classList.add("d-none");
            btnModificar.classList.remove("d-none");
        } catch (err) {
            console.error(err);
            await mostrarAlerta("error", "Error", err.message);
        }
    });

    // Eliminar desde la tabla
    tabla.on("click", ".btn-eliminar", async ev => {
        const id = ev.currentTarget.dataset.id;
        const row = tabla.row(ev.currentTarget.closest("tr")).data();
        const nombre = row[fields[1]]; 
        const { isConfirmed } = await Swal.fire({
            icon: "warning",
            title: "¿Estás seguro?",
            html: `Se eliminará:<br><strong>${nombre}</strong>`,
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });
        if (!isConfirmed) return;
        try {
            const fd = new FormData();
            fd.append(`id_${entity.slice(0, -1)}`, id);
            const data = await apiFetch(
                `/parcial1_dgcm/${entity}/eliminar${capitalize(entity)}`,
                { method: "POST", body: fd }
            );
            await mostrarAlerta("success", "Éxito", data.mensaje);
            await cargar();
        } catch (err) {
            console.error(err);
            await mostrarAlerta("error", "Error", err.message);
        }
    });

    document.addEventListener("DOMContentLoaded", cargar);
}

// función auxiliar
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
