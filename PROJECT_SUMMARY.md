# Resumen del Proyecto - Mesa de Servicios

## 📋 Descripción General

Sistema completo de Mesa de Servicios con backend en Node.js/Express/MySQL y frontend móvil en React Native.

## 🏗️ Estructura del Proyecto

```
examenfinal_appmovil/
├── mobile/                 # Aplicación móvil React Native
│   ├── screens/            # Pantallas de la app
│   ├── services/           # Servicios API
│   ├── context/            # Context API
│   ├── config/             # Configuración
│   └── components/         # Componentes reutilizables
│
├── config/                 # Configuración del backend
│   ├── database.js         # Pool de conexiones MySQL
│   ├── jwt.js              # Configuración JWT
│   └── upload.js           # Configuración de archivos
│
├── controllers/            # Controladores del backend
│   ├── authController.js
│   ├── ticketController.js
│   ├── technicianController.js
│   └── ... (11 controladores)
│
├── models/                 # Modelos de datos
│   ├── User.js
│   ├── Ticket.js
│   ├── Technician.js
│   └── ... (11 modelos)
│
├── routes/                 # Rutas de la API
│   ├── auth.js
│   ├── tickets.js
│   └── ... (10 módulos de rutas)
│
├── middleware/             # Middleware
│   ├── auth.js            # Autenticación JWT
│   ├── validator.js       # Validación de datos
│   └── errorHandler.js    # Manejo de errores
│
├── data/                   # Datos y esquemas
│   └── schema.sql         # Esquema completo de BD
│
├── docker-compose.yml      # Configuración Docker
├── Dockerfile              # Imagen Docker
├── postman_collection.json # Colección de Postman
└── server.js               # Servidor principal
```

## ✅ Módulos Implementados

### Backend (100%)

1. **Autenticación (10%)** ✅
   - Login/Registro
   - JWT tokens
   - Roles: Admin, Técnico, Usuario
   - Cambio y recuperación de contraseña

2. **Gestión de Tickets (10%)** ✅
   - CRUD completo
   - Asignación automática/manual
   - Estados y transiciones
   - Comentarios y archivos adjuntos
   - Historial de cambios

3. **Panel de Control (10%)** ✅
   - Estadísticas de tickets
   - Filtros avanzados
   - Agrupación por prioridad/técnico

4. **Gestión de Incidencias (10%)** ✅
   - Registro con tiempos
   - Clasificación por tipo
   - Historial completo

5. **Gestión de Técnicos (10%)** ✅
   - CRUD de técnicos
   - Carga de trabajo
   - Desempeño y métricas

6. **Base de Conocimientos (10%)** ✅
   - Artículos con búsqueda
   - Categorización
   - Sistema de "útil"

7. **Reportes (10%)** ✅
   - Reportes de tickets
   - Reportes SLA
   - Reportes de técnicos
   - Reportes de incidentes

8. **Feedback (10%)** ✅
   - Encuestas de satisfacción
   - Evaluación de técnicos
   - Estadísticas

9. **SLA (10%)** ✅
   - Configuración por prioridad
   - Verificación automática
   - Notificaciones de riesgo
   - Reportes de cumplimiento

10. **Configuración (10%)** ✅
    - Gestión de categorías
    - Gestión de usuarios
    - Sistema de notificaciones

### Frontend Móvil (React Native)

1. **Autenticación** ✅
   - Login
   - Registro
   - Recuperación de contraseña

2. **Dashboard** ✅
   - Estadísticas
   - Accesos rápidos

3. **Tickets** ✅
   - Lista de tickets
   - Crear ticket
   - Detalle de ticket
   - Comentarios

4. **Base de Conocimientos** ✅
   - Lista de artículos
   - Búsqueda
   - Detalle de artículos

5. **Perfil** ✅
   - Ver perfil
   - Editar perfil
   - Cerrar sesión

## 🚀 Inicio Rápido

### Backend

```bash
# Con Docker
docker-compose up -d
docker-compose exec app npm run init-admin

# Sin Docker
npm install
mysql -u root -p < data/schema.sql
npm run init-admin
npm start
```

### Frontend Móvil

```bash
cd mobile
npm install
# Editar config/api.js con la URL de tu backend
npm start
```

## 📡 Endpoints Principales

### Autenticación
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/profile`

### Tickets
- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/tickets/:id`
- `PUT /api/tickets/:id`

### Técnicos
- `GET /api/technicians`
- `POST /api/technicians`
- `GET /api/technicians/:id/performance`

### Base de Conocimientos
- `GET /api/knowledge-base`
- `POST /api/knowledge-base`
- `GET /api/knowledge-base/:id`

### Reportes
- `GET /api/reports/tickets`
- `GET /api/reports/sla`
- `GET /api/reports/technicians`

## 🔐 Credenciales por Defecto

Después de ejecutar `npm run init-admin`:

- **Email**: `admin@mesaservicios.com`
- **Password**: `Admin123!`

## 📦 Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- MySQL2 (con pool de conexiones)
- JWT (jsonwebtoken)
- bcryptjs
- multer (archivos)
- express-validator

### Frontend
- React Native
- Expo
- React Navigation
- Axios
- AsyncStorage
- Expo Image Picker
- Expo Document Picker

## 📝 Documentación

- `README.md` - Documentación del backend
- `INSTALL.md` - Guía de instalación del backend
- `mobile/README.md` - Documentación del frontend
- `mobile/INSTALL.md` - Guía de instalación del frontend
- `postman_collection.json` - Colección completa de Postman

## 🐳 Docker

El proyecto incluye configuración Docker completa:

- `docker-compose.yml` - Servicios MySQL y App
- `Dockerfile` - Imagen de la aplicación
- Volúmenes persistentes para MySQL
- Health checks configurados

## 📊 Base de Datos

Esquema completo en `data/schema.sql` con:

- 15+ tablas
- Relaciones bien definidas
- Índices optimizados
- Datos iniciales (prioridades, categorías, tipos de incidencia)
- Configuración de SLA por defecto

## 🔄 Próximas Mejoras

### Backend
- [ ] Autenticación biométrica
- [ ] SSO (Single Sign-On)
- [ ] Exportación de reportes a PDF/Excel
- [ ] Notificaciones por email/SMS

### Frontend
- [ ] Pantallas de reportes
- [ ] Pantallas de gestión de técnicos (admin)
- [ ] Pantallas de feedback
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Sincronización de datos

## 📄 Licencia

ISC

## 👥 Autor

Proyecto desarrollado para examen final de aplicación móvil.

