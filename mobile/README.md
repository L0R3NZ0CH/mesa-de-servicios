# Mesa de Servicios - Aplicación Móvil

Aplicación móvil React Native con Expo para el sistema de Mesa de Servicios.

## 🚀 Características

### Autenticación y Seguridad

- ✅ Login y Registro
- ✅ **Persistencia de sesión JWT** (no requiere login cada vez)
- ✅ Validación automática de token
- ✅ Logout automático si token expira
- ✅ Cambio de contraseña
- ✅ Recuperación de contraseña

### Gestión de Tickets

- ✅ Crear, Listar, Ver Detalle
- ✅ Filtros por rol (Admin, Técnico, Usuario)
- ✅ Comentarios públicos e internos
- ✅ Adjuntar archivos
- ✅ Estadísticas en tiempo real

### Sistema de Permisos

- ✅ 3 roles: Admin, Technician, User
- ✅ 50+ permisos específicos
- ✅ UI adaptativa según permisos
- ✅ Pantallas exclusivas por rol

### Otras Características

- ✅ Panel de Control personalizado por rol
- ✅ Base de Conocimientos
- ✅ Perfil de Usuario editable
- ✅ Notificaciones
- ✅ Reportes (Admin)
- ✅ Dashboard de Técnico con métricas de desempeño

## Requisitos

- Node.js 18+
- Expo CLI
- Android Studio (para Android) o Xcode (para iOS)

## Instalación

1. Instalar dependencias:

```bash
cd mobile
npm install
```

2. Configurar la URL de la API en `config/api.js`:

```javascript
export const API_BASE_URL = "http://TU_IP:3000/api";
```

**Nota importante para dispositivos físicos:**

- Android Emulador: usar `http://10.0.2.2:3000/api`
- iOS Simulador: usar `http://localhost:3000/api`
- Dispositivo físico: usar la IP de tu máquina (ej: `http://192.168.1.100:3000/api`)

3. Iniciar la aplicación:

```bash
npm start
```

Luego presiona:

- `a` para Android
- `i` para iOS
- `w` para web

## Estructura del Proyecto

```
mobile/
├── screens/          # Pantallas de la aplicación
│   ├── Auth/        # Login, Registro
│   ├── Dashboard/   # Panel principal
│   ├── Tickets/     # Gestión de tickets
│   ├── KnowledgeBase/ # Base de conocimientos
│   └── Profile/      # Perfil de usuario
├── services/        # Servicios API
├── context/         # Context API (Auth)
├── config/          # Configuración
└── App.js           # Componente principal
```

## Configuración de la API

Edita `config/api.js` para cambiar la URL base de la API:

```javascript
export const API_BASE_URL = __DEV__
  ? "http://TU_IP:3000/api" // Desarrollo
  : "https://tu-api.com/api"; // Producción
```

## Uso

### Autenticación

- Login con email y contraseña
- Registro de nuevos usuarios
- Recuperación de contraseña

### Tickets

- Crear nuevos tickets con archivos adjuntos
- Ver lista de tickets con filtros
- Ver detalle de ticket con comentarios
- Agregar comentarios

### Dashboard

- Estadísticas de tickets
- Accesos rápidos
- Notificaciones

### Base de Conocimientos

- Buscar artículos
- Ver artículos detallados
- Marcar como útil

## Desarrollo

Para desarrollo con hot-reload:

```bash
npm start
```

## Build para Producción

### Android

```bash
expo build:android
```

### iOS

```bash
expo build:ios
```

## Solución de Problemas

### Error de conexión a la API

- Verifica que el backend esté corriendo
- Verifica la URL en `config/api.js`
- Para dispositivo físico, usa la IP de tu máquina, no `localhost`

### Error al instalar dependencias

```bash
npm cache clean --force
rm -rf node_modules
npm install
```

## Licencia

ISC
