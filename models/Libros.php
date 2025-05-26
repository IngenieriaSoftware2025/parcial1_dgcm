<?php

namespace Model;

class Libros extends ActiveRecord
{
    //Heredadas
    protected static $tabla = 'libros';
    protected static $idTabla = 'id_libro';
    protected static $columnasDB = [
        'id_libro',
        'titulo',
        'autor',
        'situacion'
    ];

    //Propias
    public $id_libro;
    public $titulo;
    public $autor;
    public $situacion;

    //Errores
    protected static $errores = [];

    public function __construct($args = [])
    {
        foreach (static::$columnasDB as $col) {
            $this->$col = $args[$col] ?? ($col === 'situacion' ? 1 : '');
        }
    }

    public function validar()
    {
        self::$errores = [];

        $camposObligatorios = [
            'titulo' => 'El titulo del libro es obligatorio',
            'autor' => 'El autor del libro es obligatorio'
        ];

        foreach ($camposObligatorios as $campo => $mensaje) {
            if (empty($this->$campo)) {
                self::$errores[] = $mensaje;
            }
        }
        return self::$errores;
    }

    protected function arrayAtributos()
    {
        return [
            'id_libro' => $this->id_libro,
            'titulo' => $this->titulo,
            'autor' => $this->autor,
            'situacion' => $this->situacion
        ];
    }

    public function guardarLibro()
    {
        try {
            $errores = $this->validar();

            if (!empty($errores)) {
                return [
                    'exito' => false,
                    'mensaje' => implode(', ', $errores)
                ];
            }

            $resultado = $this->id_libro ? $this->actualizar() : $this->crear();

            if (!$resultado) {
                throw new \Exception('Error en la operación de base de datos');
            }

            return [
                'exito' => true,
                'mensaje' => 'Libro guardada correctamente',
                'libro' => $this->arrayAtributos()
            ];
        } catch (\Exception $e) {
            error_log("Error en guardarLibro: " . $e->getMessage());
            return [
                'exito' => false,
                'mensaje' => 'Error al guardar libro',
                'error' => $e->getMessage()
            ];
        }
    }


    public function eliminarLibro()
    {
        try {
            // borrado lógico
            $this->situacion = 0;

            $resultado = $this->guardarLibro();

            if ($resultado['exito']) {
                return ['exito' => true, 'mensaje' => 'Libro eliminado correctamente'];
            }
            return ['exito' => false, 'mensaje' => $resultado['mensaje']];
        } catch (\Exception $e) {
            return ['exito' => false, 'mensaje' => $e->getMessage()];
        }
    }




    public static function buscarPorId($id)
    {
        if (!$id) {
            throw new \Exception('Id no proporcionado');
        }
        $resultado = static::find($id);
        if (!$resultado) {
            throw new \Exception('Libro no encontrado');
        }
        $libro = new self((array)$resultado);
        return $libro;
    }

    public static function obtenerTodos()
    {
        return static::all();
    }

    public static function obtenerActivas()
    {
        $sql = "SELECT * FROM libros WHERE situacion = 1";
        $filas = static::consultarSQL($sql);
        $lista = [];
        foreach ($filas as $fila) {
            $lista[] = new self((array)$fila);
        }
        return $lista;
    }
}
