<?php

namespace Controllers;

use MVC\Router;

class AppController
{
    protected static function responderJson($data, $codigo = 200)
    {
        http_response_code($codigo);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    protected static function validarMetodo($metodo)
    {
        if ($_SERVER['REQUEST_METHOD'] !== $metodo) {
            throw new \Exception('Método HTTP no permitido');
        }
    }

    protected static function obtenerJson()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    protected static function limpiarSalida()
    {
        ob_clean();
    }

    public static function index(Router $router)
    {
        $router->render('pages/index', []);
    }
}

