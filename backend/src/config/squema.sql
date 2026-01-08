/*=======================================================*/
/*========= BASE DE DATOS CREADO CON POSTGRESQL =========*/
/*=======================================================*/

/*== CREACION DE TABLA ==*/
CREATE DATABASE reserva_escritorio

/*== TABLA USUARIOS ==*/
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*== TABLA ESCRITORIO ==*/
CREATE TABLE escritorio (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    localidad VARCHAR(100),
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*== TABLA RESERVA ==*/
CREATE TABLE reserva (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    escritorio_id INTEGER NOT NULL REFERENCES escritorio(id) ON DELETE CASCADE,
    reserva_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'confirmed' CHECK (estado IN ('confirmed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_overlap UNIQUE (escritorio_id, reserva_date, start_time, end_time)
);

/*== MEJORAS DEL SISTEMA ==*/
CREATE INDEX idx_reservas_desk_date ON reserva(escritorio_id, reserva_date);
CREATE INDEX idx_reservas_usuario ON reserva(usuario_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);

/*== FUNCION PARA ACTUALIZAR EL updated_at AUTOMATICAMENTE ==*/
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/*== TRIGGER PARA ACTUALIZAR EL updated_at ==*/
CREATE TRIGGER update_usuario_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escritorio_updated_at BEFORE UPDATE ON escritorio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reserva_updated_at BEFORE UPDATE ON reserva
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

/*== DATOS DE PRUEBA = ESCRITORIO ==*/
/*====== OPCIONAL ======*/
INSERT INTO desks (name, description, location) VALUES
    ('Escritorio 1', 'Escritorio junto a la ventana con luz natural', 'Piso 1 - Zona A'),
    ('Escritorio 2', 'Escritorio con monitor adicional', 'Piso 1 - Zona A'),
    ('Escritorio 3', 'Escritorio en zona silenciosa', 'Piso 1 - Zona B'),
    ('Escritorio 4', 'Escritorio con silla ergonómica', 'Piso 2 - Zona A'),
    ('Escritorio 5', 'Escritorio con lámpara de escritorio', 'Piso 2 - Zona B'),
    ('Escritorio 6', 'Escritorio cerca de sala de reuniones', 'Piso 2 - Zona C');