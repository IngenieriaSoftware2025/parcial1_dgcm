<?php

namespace Model;

class Prestamos extends ActiveRecord
{
    // Heredadas
    protected static $tabla = 'prestamos';
    protected static $idTabla = 'id_prestamo';
    protected static $columnasDB = [
        'id_prestamo',
        'id_libro',
        'id_persona',
        'fecha_detalle',
        'prestamo',
        'situacion'
    ];

    // Propias
    public $id_prestamo;
    public $id_libro;
    public $id_persona;
    public $fecha_detalle;
    public $prestamo = 0;
    public $situacion = 1;

    // Para relaciones
    public $libro_titulo;
    public $persona_nombres;

    // Errores
    protected static $errores = [];

    public function __construct($args = [])
    {
        $this->id_prestamo = $args['id_prestamo'] ?? null;
        $this->id_libro = $args['id_libro'] ?? '';
        $this->id_persona = $args['id_persona'] ?? '';
        $this->situacion = $args['situacion'] ?? 1;

        $this->fecha_detalle = $this->validarFecha($args['fecha_detalle'] ?? null);

        $this->prestamo = isset($args['prestamo']) ? (int)$args['prestamo'] : 0;

        $this->libro_titulo = $args['libro_titulo'] ?? '';
        $this->persona_nombres = $args['persona_nombres'] ?? '';
    }

    public function validar()
    {
        self::$errores = [];
        if (empty($this->id_libro)) {
            self::$errores[] = 'Debe seleccionar un libro';
        }
        if (empty($this->id_persona)) {
            self::$errores[] = 'Debe seleccionar un lector';
        }

        return self::$errores;
    }

    public static function toArrayList(array $instancias): array
    {
        return array_map(function (self $p) {
            return $p->attributosConRelaciones();
        }, $instancias);
    }

    public function guardarPrestamo()
    {
        try {
            $errores = $this->validar();
            if (!empty($errores)) {
                return [
                    'exito' => false,
                    'mensaje' => implode(', ', $errores)
                ];
            }
            $resultado = $this->id_prestamo ? $this->actualizar() : $this->crear();

            if (!$resultado) {
                throw new \Exception('Error en la operación de base de datos');
            }

            if (!$this->id_prestamo && isset($resultado['id'])) {
                $this->id_prestamo = $resultado['id'];
            }

            return [
                'exito' => true,
                'mensaje' => $this->id_prestamo ? 'Préstamo actualizado correctamente' : 'Préstamo guardado correctamente',
                'prestamo' => $this->attributosConRelaciones()
            ];
        } catch (\Exception $e) {
            error_log("Error en guardarPrestamo: " . $e->getMessage());
            return [
                'exito' => false,
                'mensaje' => 'Error al guardar el préstamo: ' . $e->getMessage()
            ];
        }
    }

    public function eliminarPrestamo()
    {
        try {
            $this->situacion = 0;
            $resultado = $this->guardarPrestamo();
            if ($resultado['exito']) {
                return ['exito' => true, 'mensaje' => 'Prestamo eliminado correctamente'];
            }
            throw new \Exception($resultado['error'] ?? 'Error al eliminar el prestamo');
        } catch (\Exception $e) {
            return ['exito' => false, 'mensaje' => $e->getMessage()];
        }
    }

    public static function buscarPorId($id)
    {
        if (!$id) {
            throw new \Exception('Id no proporcionado');
        }
        $row = static::find($id);
        if (!$row) {
            throw new \Exception('Prestamo no encontrado');
        }
        return new self((array)$row);
    }

    public static function obtenerTodos()
    {
        return static::all();
    }

    // Métodos para traer relaciones JOIN

    public static function obtenerConRelaciones()
    {
        $sql = "
        SELECT
            p.id_prestamo,
            p.id_libro,
            p.id_persona,
            p.fecha_detalle,
            p.prestamo,
            p.situacion,
            li.titulo AS libro_titulo,
            per.nombres AS persona_nombres
        FROM prestamos p
        INNER JOIN libros li ON p.id_libro = li.id_libro
        INNER JOIN personas per ON p.id_persona = per.id_persona 
        WHERE p.situacion = 1
        ORDER BY p.fecha_detalle DESC
    ";
        try {
            $filas = static::consultarSQL($sql);
            $lista = [];
            foreach ($filas as $fila) {
                $lista[] = new self((array)$fila);
            }
            return $lista;
        } catch (\Exception $e) {
            error_log("Error en obtenerConRelaciones: " . $e->getMessage());
            return [];
        }
    }

    public function attributosConRelaciones()
    {
        return [
            'id_prestamo' => $this->id_prestamo,
            'id_libro' => $this->id_libro,
            'id_persona' => $this->id_persona,
            'fecha_detalle' => $this->fecha_detalle,
            'prestamo' => $this->prestamo,
            'situacion' => $this->situacion,
            'libro_titulo' => $this->libro_titulo,
            'persona_nombres' => $this->persona_nombres
        ];
    }
}
