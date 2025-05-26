<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-10">
            <div class="card shadow-lg border-primary">
                <div class="card-body p-4">
                    <div class="text-center mb-4">
                        <i class="bi bi-person-plus-fill fs-1 text-primary"></i>
                        <h3 class="fw-bold mb-2 p-2 text-bg-primary">Registro de Lectores</h3>
                    </div>
                    <form id="FormPersonas" autocomplete="off">
                        <input type="hidden" name="id_persona" id="id_persona">

                        <div class="row g-3">

                            <div class="col-md-6">
                                <label for="nombres" class="form-label">
                                    Nombres
                                </label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                                    <input type="text" class="form-control" id="nombres" name="nombres" placeholder="Nombres" required>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label for="apellidos" class="form-label">
                                    Apellidos
                                </label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                                    <input type="text" class="form-control" id="apellidos" name="apellidos" placeholder="Apellidos" required>
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
                        <i class="bi bi-people-fill me-2"></i>Lectores Registrados
                    </h4>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover table-bordered w-100 table-sm" id="tablaPersonas">
                            <!-- Ups se genera solo -->
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="<?= asset('build/js/personas/index.js') ?>"></script>