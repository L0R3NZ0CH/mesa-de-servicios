# Mesa de Servicios - Aplicación Móvil React Native

Aplicación móvil completa desarrollada con React Native y Expo para el sistema de Mesa de Servicios.

## 📱 Características Implementadas

### ✅ Autenticación (10%)
- Login con email y contraseña
- Registro de usuarios
- Recuperación de contraseña
- Gestión de sesión con AsyncStorage
- Soporte para roles (Admin, Técnico, Usuario)

### ✅ Gestión de Tickets (10%)
- Crear tickets con archivos adjuntos (imágenes y documentos)
- Listar tickets con filtros
- Ver detalle completo de tickets
- Agregar comentarios
- Ver historial de cambios
- Estados: abierto, en proceso, pendiente, resuelto, cerrado

### ✅ Panel de Control (10%)
- Dashboard con estadísticas
- Tarjetas de resumen por estado
- Accesos rápidos a funciones principales
- Filtros y búsqueda

### ✅ Base de Conocimientos (10%)
- Listar artículos
- Buscar artículos por palabras clave
- Ver detalle de artículos
- Marcar como útil
- Estadísticas de vistas

### ✅ Perfil de Usuario
- Ver información del perfil
- Editar perfil
- Cambiar contraseña
- Cerrar sesión

## 🏗️ Arquitectura

### Estructura del Proyecto

```
mobile/
├── screens/              # Pantallas de la aplicación
│   ├── Auth/             # Autenticación
│   ├── Dashboard/        # Panel principal
│   ├── Tickets/          # Gestión de tickets
│   ├── KnowledgeBase/    # Base de conocimientos
│   └── Profile/          # Perfil
├── services/            # Servicios API
│   └── api.js           # Todos los endpoints
├── context/             # Context API
│   └── AuthContext.js    # Manejo de autenticación
├── config/              # Configuración
│   └── api.js           # URL base de la API
├── components/          # Componentes reutilizables
└── App.js               # Componente principal
```

### Navegación

- **Stack Navigator**: Para navegación entre pantallas
- **Tab Navigator**: Para navegación principal (Dashboard, Tickets, Base de Conocimientos, Perfil)
- **Auth Stack**: Para flujo de autenticación

## 🔌 Integración con Backend

La aplicación se conecta al backend mediante servicios API organizados por módulo:

- `authService`: Autenticación
- `ticketService`: Gestión de tickets
- `technicianService`: Gestión de técnicos
- `knowledgeBaseService`: Base de conocimientos
- `feedbackService`: Feedback y encuestas
- `reportService`: Reportes
- `slaService`: Gestión de SLA
- `notificationService`: Notificaciones
- `categoryService`: Categorías

## 🎨 UI/UX

- Diseño moderno y limpio
- Colores consistentes con el tema de la aplicación
- Navegación intuitiva
- Feedback visual en todas las acciones
- Manejo de estados de carga
- Mensajes de error claros

## 📦 Dependencias Principales

- `expo`: Framework React Native
- `@react-navigation`: Navegación
- `axios`: Cliente HTTP
- `@react-native-async-storage/async-storage`: Almacenamiento local
- `expo-image-picker`: Selección de imágenes
- `expo-document-picker`: Selección de documentos
- `date-fns`: Manejo de fechas

## 🚀 Inicio Rápido

1. **Instalar dependencias**:
```bash
cd mobile
npm install
```

2. **Configurar API**:
Edita `config/api.js` con la URL de tu backend

3. **Iniciar aplicación**:
```bash
npm start
```

4. **Abrir en dispositivo**:
- Android: Presiona `a`
- iOS: Presiona `i`
- Físico: Escanea QR con Expo Go

## 📝 Notas de Desarrollo

### Configuración de API

Para desarrollo local, configura la URL según tu entorno:

```javascript
// config/api.js
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:3000/api'  // Tu IP local
  : 'https://api-produccion.com/api';
```

### Autenticación

El token JWT se almacena automáticamente en AsyncStorage después del login y se incluye en todas las peticiones mediante interceptores de axios.

### Manejo de Errores

Todos los servicios API manejan errores de forma consistente y muestran mensajes claros al usuario.

## 🔄 Próximas Mejoras

- [ ] Pantallas de reportes
- [ ] Pantallas de gestión de técnicos (admin)
- [ ] Pantallas de feedback
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Sincronización de datos

## 📄 Licencia

ISC

