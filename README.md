# Mesa de Servicios - Backend API

Backend REST API para aplicación móvil de mesa de servicios desarrollado con Node.js, Express y MySQL.

## Características

- ✅ Autenticación JWT con roles (Admin, Técnico, Usuario)
- ✅ Gestión completa de tickets
- ✅ Sistema de notificaciones
- ✅ Base de conocimientos
- ✅ Sistema de feedback y encuestas
- ✅ Gestión de SLA
- ✅ Reportes y estadísticas
- ✅ Gestión de técnicos
- ✅ Subida de archivos adjuntos

## Requisitos

- Node.js 18+
- Docker y Docker Compose (para desarrollo)
- MySQL 8.0 (si no usas Docker)

## Instalación

### Con Docker (Recomendado)

1. Clonar el repositorio
```bash
git clone <repository-url>
cd examenfinal_appmovil
```

2. Crear archivo `.env` basado en `.env.example`
```bash
cp .env.example .env
```

3. Levantar los contenedores
```bash
docker-compose up -d
```

4. El servidor estará disponible en `http://localhost:3000`

### Sin Docker

1. Instalar dependencias
```bash
npm install
```

2. Configurar base de datos
   - Crear base de datos MySQL
   - Ejecutar el esquema SQL: `data/schema.sql`

3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. Iniciar servidor
```bash
npm start
# o para desarrollo
npm run dev
```

## Estructura del Proyecto

```
.
├── config/          # Configuración (DB, JWT, uploads)
├── controllers/     # Controladores de la API
├── data/           # Esquema SQL
├── middleware/     # Middleware (auth, validators, errors)
├── models/         # Modelos de datos
├── routes/         # Rutas de la API
├── uploads/        # Archivos subidos
├── server.js       # Punto de entrada
└── package.json
```

## Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### Tickets
- `GET /api/tickets` - Listar tickets
- `POST /api/tickets` - Crear ticket
- `GET /api/tickets/:id` - Obtener ticket
- `PUT /api/tickets/:id` - Actualizar ticket
- `POST /api/tickets/:id/comments` - Agregar comentario

### Técnicos
- `GET /api/technicians` - Listar técnicos
- `POST /api/technicians` - Crear técnico (admin)
- `GET /api/technicians/:id/performance` - Desempeño

### Base de Conocimientos
- `GET /api/knowledge-base` - Listar artículos
- `POST /api/knowledge-base` - Crear artículo
- `GET /api/knowledge-base/:id` - Obtener artículo

### Reportes
- `GET /api/reports/tickets` - Reporte de tickets
- `GET /api/reports/sla` - Reporte SLA
- `GET /api/reports/technicians` - Reporte de técnicos

## Roles de Usuario

- **admin**: Acceso completo
- **technician**: Gestión de tickets asignados
- **user**: Creación y seguimiento de sus tickets

## Base de Datos

El esquema SQL se encuentra en `data/schema.sql` y se ejecuta automáticamente al iniciar el contenedor MySQL.

## Variables de Entorno

Ver `.env.example` para la lista completa de variables de entorno.

## Desarrollo

Para desarrollo con hot-reload:
```bash
npm run dev
```

## Licencia

ISC

