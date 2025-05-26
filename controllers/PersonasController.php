<?php

namespace Controllers;

use MVC\Router;
use Model\Personas;

class PersonasController extends AppController
{
    public static function renderizarPagina(Router $router)
    {
        $router->render('Personas/index', []);
    }

    public static function guardarPersona()
    {
        try {
            self::validarMetodo('POST');
            self::limpiarSalida();

            // Debug
            error_log("POST recibido: " . json_encode($_POST));

            $datos = [
                'nombres' => $_POST['nombres'] ?? '',
                'apellidos' => $_POST['apellidos'] ?? '',
                'situacion' => 1
            ];

            $persona = new Personas($datos);
            $resultado = $persona->guardarPersona();

            // Debug
            error_log("Resultado guardado: " . json_encode($resultado));

            self::responderJson([
                'tipo' => $resultado['exito'] ? 'success' : 'error',
                'mensaje' => $resultado['mensaje'],
                'persona' => $resultado['exito'] ? $persona : null
            ], $resultado['exito'] ? 200 : 400);
        } catch (\Exception $e) {
            error_log("Error en guardarPersona controller: " . $e->getMessage());
            self::responderJson([
                'tipo' => 'error',
                'mensaje' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function buscarPersona()
    {
        try {
            self::validarMetodo('GET');
            self::limpiarSalida();

            $id = $_GET['id_persona'] ?? null;
            $persona = Personas::buscarPorId($id);

            self::responderJson([
                'tipo' => 'success',
                'persona' => $persona
            ]);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo' => 'error',
                'mensaje' => $e->getMessage()
            ], 404);
        }
    }

    public static function obtenerPersonas()
    {
        try {
            self::validarMetodo('GET');
            self::limpiarSalida();

            // activas
            $personas = Personas::obtenerActivas();

            self::responderJson([
                'tipo' => 'success',
                'personas' => $personas ?: [],
                'mensaje' => $personas
                    ? 'Personas obtenidas correctamente'
                    : 'No hay personas registradao'
            ]);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo' => 'error',
                'mensaje' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }


    public static function modificarPersona()
    {
        try {
            self::validarMetodo('POST');
            self::limpiarSalida();

            $id = $_POST['id_persona'] ?? null;
            $persona = Personas::buscarPorId($id);
            $persona->sincronizar($_POST);

            $resultado = $persona->guardarPersona();

            self::responderJson([
                'tipo' => $resultado['exito'] ? 'success' : 'error',
                'mensaje' => $resultado['mensaje'],
                'persona' => $resultado['exito'] ? $persona : null
            ], $resultado['exito'] ? 200 : 400);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo' => 'error',
                'mensaje' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function eliminarPersona()
    {
        try {
            self::validarMetodo('POST');
            self::limpiarSalida();

            $id = $_POST['id_persona'] ?? null;
            $persona = Personas::buscarPorId($id);

            $resultado = $persona->eliminarPersona();

            self::responderJson([
                'tipo' => $resultado['exito'] ? 'success' : 'error',
                'mensaje' => $resultado['mensaje']
            ], $resultado['exito'] ? 200 : 400);
        } catch (\Exception $e) {
            self::responderJson([
                'tipo' => 'error',
                'mensaje' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
