<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-10">
            <div class="card shadow-lg border-primary">
                <div class="card-body p-4">
                    <div class="text-center mb-4">
                        <i class="bi bi-cart-plus-fill fs-1 text-primary"></i>
                        <h3 class="fw-bold mb-2 p-2 text-bg-primary">Registro de prestamos</h3>
                    </div>
                    <form id="Formprestamos">
                        <input type="hidden" name="id_prestamo" id="id_prestamo">

                        <div class="col-md-6">
                            <label for="id_libro" class="form-label">
                                Libro
                            </label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-tags"></i></span>
                                <select class="form-select" id="id_libro" name="id_libro" required>
                                    <option value="">Seleccione un libro</option>
                                    <!-- Rancio-->
                                </select>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <label for="id_persona" class="form-label">
                                Lector
                            </label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-flag"></i></span>
                                <select class="form-select" id="id_persona" name="id_persona" required>
                                    <option value="">Seleccione un lector</option>
                                    <!-- Rancio -->
                                </select>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="fecha_detalle" class="form-label">Fecha Detalle</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-clock-fill"></i>
                                </span><input type="datetime-local" class="form-control" id="fecha_detalle" name="fecha_detalle" required />
                            </div>
                        </div>

                        <div class="row justify-content-center mt-4 g-2">
                            <div class="col-auto">
                                <button class="btn btn-success px-4" type="submit" id="btnGuardar">
                                    <i class="bi bi-floppy-fill me-1"></i>Guardar
                                </button>
                            </div>
                            <div class="col-auto">
                                <button class="btn btn-warning px-4 d-none" type="button" id="btnModificar">
                                    <i class="bi bi-pencil-fill me-1"></i>Modificar
                                </button>
                            </div>
                            <div class="col-auto">
                                <button class="btn btn-secondary px-4" type="reset" id="btnLimpiar">
                                    <i class="bi bi-eraser-fill me-1"></i>Limpiar
                                </button>
                            </div>
                        </div>
                </div>
                </form>
            </div>
        </div>
    </div>
</div>

<div class="row justify-content-center mt-4">
    <div class="col-lg-10">
        <div class="card shadow-lg border-primary">
            <div class="card-body p-4">
                <h4 class="text-center fw-bold mb-3 text-primary">
                    <i class="bi bi-cart-fill me-2"></i>Lista de libros Activos
                </h4>

                <ul class="nav nav-tabs mb-3" id="productosPrestamo">
                    <li class="nav-item">
                        <a class="nav-link active" data-bs-toggle="tab" href="#activos">
                            <i class="bi bi-clock-fill me-1"></i>Activos
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-bs-toggle="tab" href="#devueltos">
                            <i class="bi bi-check-circle-fill me-1"></i>Prestados
                        </a>
                    </li>
                </ul>

                <div class="tab-content">
                    <div class="tab-pane fade show active" id="activos">

                        <div class="row mb-3">
                            <div class="col">
                                <div class="card">
                                    <div class="card-body">
                                        <h5 class="card-title">Estado de prestamos</h5>
                                        <p id="resumenprestamos" class="mb-0">Cargando...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-striped table-hover table-bordered w-100 table-sm"
                                id="tablaprestamos">
                                <!-- Rancio -->
                            </table>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="devueltos">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover table-bordered w-100 table-sm"
                                id="tablaprestamosDevueltos">
                                <!-- Rancio -->
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</div>

<script src="<?= asset('build/js/prestamos/index.js') ?>"></script>