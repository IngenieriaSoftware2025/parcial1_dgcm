-- 1) Base de datos
CREATE DATABASE parcial1_dgcm;

-- 2) Tabla clientes = personas

select * from personas
CREATE TABLE personas (
    id_persona   SERIAL PRIMARY KEY,
    nombres      VARCHAR(80)  NOT NULL,
    apellidos    VARCHAR(80)  NOT NULL,
    situacion    SMALLINT     DEFAULT 1
);


-- 4) Tabla prioridades = libros
select* from libros

CREATE TABLE libros (
    id_libro SERIAL PRIMARY KEY,
    titulo       VARCHAR(100) NOT NULL,
    autor       VARCHAR(100) NOT NULL,
    situacion    SMALLINT     DEFAULT 1
);

-- prestamos = prestamo
select * from prestamos
CREATE TABLE prestamos (
    id_prestamo   SERIAL PRIMARY KEY,
    id_libro  INTEGER      NOT NULL,
    id_persona  INTEGER      NOT NULL,
    fecha_detalle DATETIME YEAR TO SECOND,
    prestamo      SMALLINT     DEFAULT 0,
    situacion     SMALLINT     DEFAULT 1
);

ALTER TABLE prestamos ADD CONSTRAINT FOREIGN KEY (id_libro) REFERENCES libros(id_libro);
ALTER TABLE prestamos ADD CONSTRAINT FOREIGN KEY (id_persona) REFERENCES personas(id_persona);
