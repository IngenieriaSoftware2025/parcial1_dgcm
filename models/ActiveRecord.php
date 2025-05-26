<?php

namespace Model;

use PDO;

class ActiveRecord
{

    // Base DE DATOS
    protected static $db;
    protected static $tabla = '';
    protected static $columnasDB = [];

    protected static $idTabla = '';

    // Alertas y Mensajes
    protected static $alertas = [];
    protected static $isTablasCompuestas = [];
    // Errores
    protected static $errores = [];

    // Definir la conexión a la BD - includes/database.php
    public static function setDB($database)
    {
        self::$db = $database;
    }

    public static function setAlerta($tipo, $mensaje)
    {
        static::$alertas[$tipo][] = $mensaje;
    }
    // Validación
    public static function getAlertas()
    {
        return static::$alertas;
    }

    public function validar()
    {
        static::$alertas = [];
        return static::$alertas;
    }

    // Registros - CRUD
    public function guardar()
    {
        $resultado = '';
        $id = static::$idTabla ?? 'id';
        if (!is_null($this->$id)) {
            // actualizar
            $resultado = $this->actualizar();
        } else {
            // Creando un nuevo registro
            $resultado = $this->crear();
        }
        return $resultado;
    }

    public static function all()
    {
        $query = "SELECT * FROM " . static::$tabla;
        $resultado = self::consultarSQL($query);

        // debuguear($resultado);
        return $resultado;
    }

    // // Busca un registro por su id
    public static function find($id = [])
    {
        $idQuery = static::$idTabla ?? 'id';
        $query = "SELECT * FROM " . static::$tabla;

        if (is_array(static::$idTabla)) {
            foreach (static::$isTablasCompuestas as $key => $value) {
                if ($value == reset(static::$isTablasCompuestas)) {
                    $query .= " WHERE $value = " . self::$db->quote($id[$value]);
                } else {
                    $query .= " AND $value = " . self::$db->quote($id[$value]);
                }
            }
        } else {

            $query .= " WHERE $idQuery = $id";
        }

        $resultado = self::consultarSQL($query);
        return array_shift($resultado);
    }

    // Obtener Registro
    public static function get($limite)
    {
        $query = "SELECT * FROM " . static::$tabla . " LIMIT ${limite}";
        $resultado = self::consultarSQL($query);
        return array_shift($resultado);
    }

    // Busqueda Where con Columna 
    public static function where($columna, $valor, $condicion = '=')
    {
        $query = "SELECT * FROM " . static::$tabla . " WHERE ${columna} ${condicion} '${valor}'";
        $resultado = self::consultarSQL($query);
        return  $resultado;
    }

    // SQL para Consultas Avanzadas.
    public static function SQL($consulta)
    {
        $query = $consulta;
        $resultado = self::$db->query($query);
        return $resultado;
    }

    // crea un nuevo registro
    public function crear()
    {
        // Sanitizar los datos
        $atributos = $this->sanitizarAtributos();

        // Insertar en la base de datos
        $query = " INSERT INTO " . static::$tabla . " ( ";
        $query .= join(', ', array_keys($atributos));
        $query .= " ) VALUES (";
        $query .= join(", ", array_values($atributos));
        $query .= " ) ";


        // debuguear($query);

        // Resultado de la consulta
        $resultado = self::$db->exec($query);

        return [
            'resultado' =>  $resultado,
            'id' => self::$db->lastInsertId(static::$tabla)
        ];
    }

    public function actualizar()
    {
        // Sanitizar los datos
        $atributos = $this->sanitizarAtributos();

        // Iterar para ir agregando cada campo de la BD
        $valores = [];
        foreach ($atributos as $key => $value) {
            $valores[] = "{$key}={$value}";
        }
        $id = static::$idTabla ?? 'id';

        $query = "UPDATE " . static::$tabla . " SET ";
        $query .=  join(', ', $valores);

        if (is_array(static::$idTabla)) {

            foreach (static::$isTablasCompuestas as $key => $value) {
                if ($value == reset(static::$isTablasCompuestas)) {
                    $query .= " WHERE $value = " . self::$db->quote($this->$value);
                } else {
                    $query .= " AND $value = " . self::$db->quote($this->$value);
                }
            }
        } else {
            $query .= " WHERE " . $id . " = " . self::$db->quote($this->$id) . " ";
        }

        // debuguear($query);

        $resultado = self::$db->exec($query);
        return [
            'resultado' =>  $resultado,
        ];
    }


    // Eliminar un registro - Toma el ID de Active Record

    public function eliminar()
    {
        $idQuery = static::$idTabla ?? 'id';
        $query = "DELETE FROM "  . static::$tabla . " WHERE $idQuery = " . self::$db->quote($this->$idQuery);
        $resultado = self::$db->exec($query);
        return $resultado;
    }


    public static function consultarSQL($query)
    {
        // Consultar la base de datos
        $resultado = self::$db->query($query);

        // Iterar los resultados
        $array = [];
        while ($registro = $resultado->fetch(PDO::FETCH_ASSOC)) {
            $array[] = static::crearObjeto($registro);
        }

        // liberar la memoria
        $resultado->closeCursor();

        // retornar los resultados
        return $array;
    }

    public static function fetchArray($query)
    {
        $resultado = self::$db->query($query);
        $respuesta = $resultado->fetchAll(PDO::FETCH_ASSOC);
        foreach ($respuesta as $value) {
            $data[] = array_change_key_case(array_map('utf8_encode', $value));
        }
        $resultado->closeCursor();
        return $data;
    }


    public static function fetchFirst($query)
    {
        $resultado = self::$db->query($query);
        $respuesta = $resultado->fetchAll(PDO::FETCH_ASSOC);
        $data = [];
        foreach ($respuesta as $value) {
            $data[] = array_change_key_case(array_map('utf8_encode', $value));
        }
        $resultado->closeCursor();
        return array_shift($data);
    }

    protected static function crearObjeto($registro)
    {
        $objeto = new static;

        foreach ($registro as $key => $value) {
            $key = strtolower($key);
            if (property_exists($objeto, $key)) {
                $objeto->$key = utf8_encode($value);
            }
        }

        return $objeto;
    }



    // Identificar y unir los atributos de la BD
    public function atributos()
    {
        $atributos = [];
        foreach (static::$columnasDB as $columna) {
            $columna = strtolower($columna);
            if ($columna === 'id' || $columna === static::$idTabla) continue;
            $atributos[$columna] = $this->$columna;
        }
        return $atributos;
    }

    public function sanitizarAtributos()
    {
        $atributos = $this->atributos();
        $sanitizado = [];
        foreach ($atributos as $key => $value) {
            $sanitizado[$key] = self::$db->quote($value);
        }
        return $sanitizado;
    }

    public function sincronizar($args = [])
    {
        foreach ($args as $key => $value) {
            if (property_exists($this, $key) && !is_null($value)) {
                $this->$key = $value;
            }
        }
    }


    // A PARTIR DE AQUI LAS FUNCIONES SON MIAS 


    protected function attributosConRelaciones()
    {
        $atributos = [];

        // Obtener atributos básicos de columnas DB
        foreach (static::$columnasDB as $columna) {
            $atributos[$columna] = $this->$columna;
        }

        // Obtener atributos de relaciones (propiedades que terminan en _nombre)
        $propiedades = get_object_vars($this);
        foreach ($propiedades as $prop => $valor) {
            if (str_ends_with($prop, '_nombre')) {
                $atributos[$prop] = $valor;
            }
        }

        return $atributos;
    }

    protected function validarDuplicado($campos, $mensajeError = null)
    {
        try {
            // Construir condiciones WHERE
            $condiciones = [];
            $valores = [];

            foreach ($campos as $campo => $valor) {
                if ($campo === 'nombre') {
                    $condiciones[] = "LOWER($campo) = LOWER(?)";
                } else {
                    $condiciones[] = "$campo = ?";
                }
                $valores[] = $valor;
            }

            // Agregar condición de situación activa
            $condiciones[] = "situacion = 1";

            // Si es actualización, excluir el registro actual
            $id = static::$idTabla;
            if ($this->$id) {
                $condiciones[] = "$id <> ?";
                $valores[] = $this->$id;
            }

            // Construir y ejecutar consulta
            $sql = "SELECT COUNT(*) as cnt FROM " . static::$tabla .
                " WHERE " . implode(" AND ", $condiciones);

            $stmt = self::$db->prepare($sql);
            $stmt->execute($valores);
            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

            return [
                'duplicado' => ($resultado['cnt'] > 0),
                'mensaje' => $mensajeError ?? 'Registro duplicado'
            ];
        } catch (\Exception $e) {
            error_log("Error en validarDuplicado: " . $e->getMessage());
            return [
                'duplicado' => false,
                'mensaje' => 'Error al validar duplicados'
            ];
        }
    }

    protected function guardarSeguro($validarDuplicados = [], $mensajeError = null)
    {
        try {
            // 1. Validar duplicados si se especifican campos
            if (!empty($validarDuplicados)) {
                $resultadoValidacion = $this->validarDuplicado($validarDuplicados, $mensajeError);
                if ($resultadoValidacion['duplicado']) {
                    return [
                        'exito' => false,
                        'mensaje' => $resultadoValidacion['mensaje']
                    ];
                }
            }

            // 2. Validar campos requeridos
            $errores = $this->validar();
            if (!empty($errores)) {
                return [
                    'exito' => false,
                    'mensaje' => implode(', ', $errores)
                ];
            }

            // 3. Guardar
            $resultado = $this->guardar();
            if (!$resultado) {
                throw new \Exception('Error en la operación de base de datos');
            }

            // 4. Retornar respuesta exitosa
            $id = static::$idTabla;
            return [
                'exito' => true,
                'mensaje' => $this->$id ?
                    'Registro actualizado correctamente' :
                    'Registro guardado correctamente',
                'data' => $this->attributosConRelaciones()
            ];
        } catch (\Exception $e) {
            error_log("Error en guardarSeguro: " . $e->getMessage());
            return [
                'exito' => false,
                'mensaje' => 'Error al guardar el registro'
            ];
        }
    }
}
