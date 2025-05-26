<?php

namespace Controllers;

use MVC\Router;
use Model\Libros;

class LibrosController extends AppController
{
    public static function renderizarPagina(Router $router)
    {
        $router->render('libros/index', []);
    }

    public static function guardarLibro()
{
    self::validarMetodo('POST');
    self::limpiarSalida();

    // Armo los datos directamente
    $datos = [
        'titulo'    => $_POST['titulo']    ?? '',
        'autor'     => $_POST['autor']     ?? '',
        'situacion' => 1
    ];

    // Creo el objeto y lo guardo
    $libro = new Libros($datos);
    $resultado  = $libro->guardarLibro();

    self::responderJson([
        'tipo'=> $resultado['exito']   ? 'success' : 'error',
        'mensaje'=> $resultado['mensaje'],
        'libro'=> $resultado['exito']   ? $resultado['libro'] : null,
        'debugError'=> $resultado['error']    ?? null
    ], $resultado['exito'] ? 200 : 400);
}


    public static function buscarLibro()
    {
        try {
            self::validarMetodo('GET');
            self::limpiarSalida();

            $id = $_GET['id_libro'] ?? null;
            $libro = Libros::buscarPorId($id);

            self::responderJson([
                'tipo' => 'success',
                'libro' => $libro
            ]);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo' => 'error',
                'mensaje' => $e->getMessage()
            ], 404);
        }
    }

    public static function obtenerLibros()
    {
        try {
            self::validarMetodo('GET');
            self::limpiarSalida();

            // Sólo activas
            $libroes = Libros::obtenerActivas();

            self::responderJson([
                'tipo' => 'success',
                'libros' => $libroes ?: [],
                'mensaje' => $libroes
                    ? 'Libros obtenidas correctamente'
                    : 'No hay Libros registradas'
            ]);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo' => 'error',
                'mensaje' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function modificarLibro()
    {
        try {
            self::validarMetodo('POST');
            self::limpiarSalida();

            $id = $_POST['id_libro'] ?? null;
            $libro = Libros::buscarPorId($id);
            $libro->sincronizar($_POST);

            $resultado = $libro->guardarLibro();

            self::responderJson([
                'tipo' => $resultado['exito'] ? 'success' : 'error',
                'mensaje' => $resultado['mensaje'],
                'libro' => $resultado['exito'] ? $libro : null
            ], $resultado['exito'] ? 200 : 400);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo' => 'error',
                'mensaje' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function eliminarLibro()
    {
        try {
            self::validarMetodo('POST');
            self::limpiarSalida();

            $id        = $_POST['id_libro'] ?? null;
            $libro = Libros::buscarPorId($id);

            $filas = Libros::consultarSQL(
                "SELECT COUNT(*) AS cnt
             FROM libros
             WHERE id_libro = " . (int)$id . "
               AND situacion = 1"
            );

            $count = 0;
            if (!empty($filas)) {
                $first = $filas[0];
                $count = is_object($first)
                    ? ($first->cnt  ?? 0)
                    : ($first['cnt'] ?? 0);
            }

            if ($count > 0) {
                throw new \Exception('No se puede eliminar: hay libros asignados a este prestamo');
            }

            $res = $libro->eliminarLibro();

            self::responderJson([
                'tipo'    => $res['exito'] ? 'success' : 'error',
                'mensaje' => $res['mensaje']
            ], $res['exito'] ? 200 : 400);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo'    => 'error',
                'mensaje' => $e->getMessage()
            ], 400);
        }
    }
}
