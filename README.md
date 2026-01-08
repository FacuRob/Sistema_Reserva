# 📍 Sistema de Reservas de Escritorios - Coworking Express

Sistema web completo para la gestión de reservas de escritorios en espacios de coworking. Permite a los usuarios reservar escritorios por fecha y hora.

## 🚀 Tecnologías Utilizadas

### 🛠️ Stack Tecnológico

#### Frontend
<div align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
</div>

* **React 18**: Librería principal para la interfaz de usuario.
* **Vite**: Herramienta de construcción rápida para el frontend.
* **React Router DOM**: Manejo de rutas y navegación dinámica.
* **Tailwind CSS v3**: Framework de estilos basado en utilidades.
* **Axios**: Cliente HTTP para el consumo de la API.

#### Backend
<div align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/bcryptjs-orange?style=for-the-badge" alt="bcryptjs" />
</div>

* **Node.js & Express**: Entorno de ejecución y framework para la API.
* **PostgreSQL**: Sistema de gestión de base de datos relacional.
* **JWT (JSON Web Tokens)**: Implementación de seguridad y sesiones.
* **bcryptjs**: Encriptación de contraseñas de usuario.
* **node-postgres (pg)**: Driver cliente para la comunicación con la base de datos.

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn
- Git

## 🔧 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/FacuRob/Sistema_Reserva.git
cd reserva-escritorio
```

### 2. Configurar la Base de Datos

```bash
# Crear la base de datos en PostgreSQL
CREATE DATABASE reserva_escritorio;

# Ejecutar el script SQL (ubicado en backend/database/schema.sql)
psql -U postgres -d reserva_escritorio -f backend/database/schema.sql
```

**Script SQL básico:**

```sql
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

CREATE TABLE escritorio (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    localidad VARCHAR(100),
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Insertar escritorios de prueba o agregar en el sistema
INSERT INTO escritorio (nombre, descripcion, localidad) VALUES
    ('Escritorio 1', 'Escritorio junto a la ventana con luz natural', 'Piso 1 - Zona A'),
    ('Escritorio 2', 'Escritorio con monitor adicional', 'Piso 1 - Zona A'),
    ('Escritorio 3', 'Escritorio en zona silenciosa', 'Piso 1 - Zona B'),
    ('Escritorio 4', 'Escritorio con silla ergonómica', 'Piso 2 - Zona A'),
    ('Escritorio 5', 'Escritorio con lámpara de escritorio', 'Piso 2 - Zona B');
```

### 3. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales
# Ejemplo:
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=reserva_escritorio
JWT_SECRET=tu_secreto_super_secreto_hace_el_cambio
JWT_EXPIRES_IN=7d
```

### 4. Configurar el Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env
# Ejemplo:
VITE_API_URL=http://localhost:3000/api
```

### 5. Iniciar el Proyecto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Abre tu navegador en `http://localhost:5173`

## 📱 Uso del Sistema

### Para Usuarios

1. **Registro**: Crear una cuenta con nombre, apellido, email, teléfono y contraseña
2. **Login**: Iniciar sesión con email y contraseña
3. **Ver Escritorios**: Explorar los escritorios disponibles
4. **Hacer Reserva**: Seleccionar escritorio, fecha y horario
5. **Mis Reservas**: Ver, cancelar o eliminar reservas propias

### Para Administradores

1. **Panel Admin**: Acceso a estadísticas y gestión completa
2. **Gestionar Escritorios**: Crear, editar, eliminar escritorios
3. **Ver Todas las Reservas**: Visualizar todas las reservas del sistema
4. **Disponibilidad**: Controlar el estado de cada escritorio

## 🔑 API Endpoints

### Autenticación 
# ubicado en frontend/src/pages/auth
- `POST /api/auth/registro` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Obtener perfil (requiere token)

### Escritorios
# ubicado en frontend/src/pages/escritorios
- `GET /api/escritorios` - Listar todos los escritorios
- `GET /api/escritorios/:id` - Obtener escritorio específico
- `GET /api/escritorios/:id/disponibilidad?fecha=YYYY-MM-DD` - Ver disponibilidad
- `POST /api/escritorios` - Crear escritorio (requiere token)
- `PUT /api/escritorios/:id` - Actualizar escritorio (requiere token)
- `DELETE /api/escritorios/:id` - Eliminar escritorio (requiere token)

### Reservas
# ubicado en frontend/src/pages/reservas
- `POST /api/reservas` - Crear reserva (requiere token)
- `GET /api/reservas` - Listar todas las reservas (requiere token)
- `GET /api/reservas/mis-reservas` - Mis reservas (requiere token)
- `GET /api/reservas/:id` - Obtener reserva específica (requiere token)
- `PUT /api/reservas/:id` - Actualizar reserva (requiere token)
- `PATCH /api/reservas/:id/cancelar` - Cancelar reserva (requiere token)
- `DELETE /api/reservas/:id` - Eliminar reserva (requiere token)

## 🎯 Características Implementadas

✅ Sistema de autenticación con JWT  
✅ Registro e inicio de sesión de usuarios  
✅ Gestión de escritorios (CRUD completo)  
✅ Sistema de reservas por hora  
✅ Validación de solapamiento de horarios  
✅ Panel de administración  
✅ Vista de disponibilidad en tiempo real  
✅ Gestión de reservas (crear, cancelar, eliminar)  
✅ Diseño responsive con Tailwind CSS  
✅ Protección de rutas (frontend y backend)  

## 🚧 Mejoras Futuras - Propuestas

### Funcionalidades
- [ ] **Sistema de Roles**: Diferenciar entre usuarios y administradores
- [ ] **Notificaciones por Email**: Confirmación de reservas
- [ ] **Recordatorios**: Alertas antes de la reserva
- [ ] **Reservas Recurrentes**: Reservar el mismo horario semanalmente
- [ ] **Favoritos**: Marcar escritorios preferidos
- [ ] **Búsqueda Avanzada**: Filtros por ubicación, características

### UI/UX
- [ ] **Modo Oscuro**: Toggle de tema claro/oscuro
- [ ] **Mapa Interactivo**: Mapa del coworking con escritorios
- [ ] **Tour Guiado**: Onboarding para nuevos usuarios
- [ ] **Animaciones**: Transiciones más fluidas

### Seguridad
- [ ] **2FA**: Autenticación de dos factores
- [ ] **Recuperación de Contraseña**: Sistema de reset por email
- [ ] **Expiración de Sesión**: Renovación automática de tokens
- [ ] **HTTPS**: Forzar conexiones seguras en producción
- [ ] **CORS**: Configuración más restrictiva

### Deployment
- [ ] **Backend**: Desplegar en Render
- [ ] **Frontend**: Desplegar en Netlify
- [ ] **Base de Datos**: PostgreSQL en Supabase
- [ ] **Variables de Entorno**: Gestión segura en producción

## 🐛 Problemas Conocidos

- La validación de solapamiento podría optimizarse para grandes volúmenes de reservas
- No hay confirmación de email en el registro
- Las contraseñas deben tener requisitos mínimos de seguridad más estrictos
- Falta manejo de zonas horarias (actualmente usa hora local del servidor)

## 📝 Decisiones Técnicas

### ¿Por qué estas tecnologías?

- **PostgreSQL**: Base de datos relacional robusta, ideal para manejo de transacciones y constraints (como validación de solapamiento)
- **Express**: Framework minimalista y flexible para Node.js
- **React + Vite**: Desarrollo rápido con HMR y mejor experiencia de desarrollo que Create React App
- **Tailwind CSS**: Desarrollo ágil de UI sin salir del JSX
- **JWT**: Stateless authentication, escalable y simple de implementar

### Estructura del Código

- **Separación de responsabilidades**: Controladores, rutas y servicios separados
- **Context API**: Para estado global (autenticación) en lugar de Redux (overkill para este proyecto)
- **Servicios de API**: Centralizar todas las peticiones HTTP
- **Componentes reutilizables**: Button, Input, Card para mantener consistencia

## 📄 Licencia

Este proyecto fue desarrollado como parte de un ejercicio de aprendizaje y solicitud de un cliente.

## 👤 Autor

Desarrollado por Facundo Robles
