<?php

namespace Controllers;

use MVC\Router;
use Model\Prestamos;

class PrestamosController extends AppController
{
    public static function renderizarPagina(Router $router)
    {
        $router->render('prestamos/index', []);
    }

    public static function guardarPrestamo()
    {
        try {
            self::validarMetodo('POST');
            self::limpiarSalida();

            // Debug
            error_log("POST recibido (prestamo): " . json_encode($_POST));

            $datos = [
                'id_libro' => $_POST['id_libro'] ?? '',
                'id_persona' => $_POST['id_persona'] ?? ''
            ];

            $prestamo = new Prestamos($datos);
            $resultado = $prestamo->guardarPrestamo();

            // Debug
            error_log("Resultado guardarPrestamo: " . json_encode($resultado));

            self::responderJson([
                'tipo'     => $resultado['exito'] ? 'success' : 'error',
                'mensaje'  => $resultado['mensaje'],
                'prestamo' => $resultado['exito'] ? $prestamo : null
            ], $resultado['exito'] ? 200 : 400);
        } catch (\Exception $e) {
            error_log("Error en guardarPrestamo controller: " . $e->getMessage());
            self::responderJson([
                'tipo'    => 'error',
                'mensaje' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function buscarPrestamo()
    {
        try {
            self::validarMetodo('GET');
            self::limpiarSalida();

            $id = $_GET['id_prestamo'] ?? null;
            $prestamo = Prestamos::buscarPorId($id);

            self::responderJson([
                'tipo'     => 'success',
                'prestamo' => $prestamo
            ]);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo'    => 'error',
                'mensaje' => $e->getMessage()
            ], 404);
        }
    }

    public static function obtenerPrestamos()
    {
        try {
            self::validarMetodo('GET');
            self::limpiarSalida();

            $lista = Prestamos::obtenerConRelaciones();

            // Convierte cada objeto a un array plano
            $data = Prestamos::toArrayList($lista);

            self::responderJson([
                'tipo'      => 'success',
                'prestamos' => $data,
                'mensaje'   => $data
                    ? 'prestamos obtenidos correctamente'
                    : 'No hay prestamos registrados'
            ]);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo'    => 'error',
                'mensaje' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }


    public static function modificarPrestamo()
    {
        try {
            self::validarMetodo('POST');
            self::limpiarSalida();

            $id = $_POST['id_prestamo'] ?? null;
            $prestamo = Prestamos::buscarPorId($id);
            $prestamo->sincronizar($_POST);

            $resultado = $prestamo->guardarPrestamo();

            self::responderJson([
                'tipo'     => $resultado['exito'] ? 'success' : 'error',
                'mensaje'  => $resultado['mensaje'],
                'prestamos' => $resultado['exito'] ? $prestamo : null
            ], $resultado['exito'] ? 200 : 400);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo'    => 'error',
                'mensaje' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function eliminarPrestamo()
    {
        try {
            self::validarMetodo('POST');
            self::limpiarSalida();

            $id = $_POST['id_prestamo'] ?? null;
            $prestamo = Prestamos::buscarPorId($id);

            $resultado = $prestamo->eliminarPrestamo();

            self::responderJson([
                'tipo'    => $resultado['exito'] ? 'success' : 'error',
                'mensaje' => $resultado['mensaje']
            ], $resultado['exito'] ? 200 : 400);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo'    => 'error',
                'mensaje' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
