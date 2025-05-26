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
    public $prestamo;
    public $situacion;

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
        if (isset($args['fecha_detalle'])) {
            $f = str_replace('T', ' ', $args['fecha_detalle']);
            if (strlen($f) === 16) {
                $f .= ':00';
            }
            $this->fecha_detalle = $f;
        } else {
            $this->fecha_detalle = date('Y-m-d H:i:s');
        }
        // Inicializar campos de relación (si vienen en $args)
        $this->libro_titulo  = $args['libro_titulo']  ?? '';
        $this->persona_nombres  = $args['persona_nombres']  ?? '';
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
        return $this->guardarSeguro(
            [
                'id_prestamo' => $this->id_prestamo,
                'id_libro' => $this->id_libro,
                'id_persona' => $this->id_persona
            ],
            'Ya existe ese prestamo para este lector y libro'
        );
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
            p.*,
            li.titulo AS libro_titulo,
            per.nombres AS persona_nombres,
        FROM prestamos p
        JOIN libros li ON p.id_libro = li.id_libro
        JOIN personas per ON p.id_persona = per.id_persona 
        WHERE p.situacion = 1
    ";
        $filas = static::consultarSQL($sql);
        $lista = [];
        foreach ($filas as $fila) {
            $lista[] = new self((array)$fila);
        }
        return $lista;
    }
}
