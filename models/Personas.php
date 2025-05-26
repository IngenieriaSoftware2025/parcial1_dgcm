<?php

namespace Model;

class Personas extends ActiveRecord
{
    // Configuración de la tabla
    protected static $tabla = 'personas';
    protected static $idTabla = 'id_persona';
    protected static $columnasDB = [
        'id_persona',
        'nombres',
        'apellidos',
        'situacion'
    ];

    // Propiedades de instancia
    public $id_persona;
    public $nombres;
    public $apellidos;
    public $situacion;

    // Array para errores
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

        // Campos obligatorios
        $camposObligatorios = [
            'nombres' => 'El nombre es obligatorio',
            'apellidos' => 'El apellido es obligatorio'
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
            'id_persona' => $this->id_persona,
            'nombres' => $this->nombres,
            'apellidos' => $this->apellidos,
            'situacion' => $this->situacion
        ];
    }

    public function toArray(): array
    {
        return $this->arrayAtributos();
    }


    public function guardarPersona()
    {
        try {
            // Validar primero
            $errores = $this->validar();
            if (!empty($errores)) {
                return [
                    'exito' => false,
                    'mensaje' => implode(', ', $errores)
                ];
            }

            // Intentar crear/actualizar
            $resultado = $this->id_persona ? $this->actualizar() : $this->crear();

            if (!$resultado) {
                throw new \Exception('Error en la operación de base de datos');
            }

            return [
                'exito' => true,
                'mensaje' => 'Persona guardado correctamente',
                'persona' => $this->arrayAtributos()
            ];
        } catch (\Exception $e) {
            error_log("Error en guardarPersona: " . $e->getMessage());
            return [
                'exito' => false,
                'mensaje' => 'Error al guardar el persona',
                'error' => $e->getMessage()
            ];
        }
    }

    public function eliminarPersona()
    {
        try {
            $this->situacion = 0;
            $resultado = $this->guardar();

            if (($resultado['resultado']) ?? false) {
                return [
                    'exito' => true,
                    'mensaje' => 'Persona eliminado correctamente'
                ];
            }

            throw new \Exception($resultado['error'] ?? 'Error al eliminar la persona');
        } catch (\Exception $e) {
            return [
                'exito' => false,
                'mensaje' => $e->getMessage()
            ];
        }
    }

    // Métodos estáticos de búsqueda
    public static function buscarPorId($id)
    {
        if (!$id) {
            throw new \Exception('ID no proporcionado');
        }

        $resultado = static::find($id);
        if (!$resultado) {
            throw new \Exception('Persona no encontrada');
        }

        $persona = new self((array)$resultado);
        return $persona;
    }

    public static function obtenerTodos()
    {
        return static::all();
    }

    public static function obtenerActivas()
    {
        $sql   = "SELECT * FROM personas WHERE situacion = 1";
        $filas = static::consultarSQL($sql);
        $lista = [];
        foreach ($filas as $fila) {
            $lista[] = new self((array)$fila);
        }
        return $lista;
    }
}
