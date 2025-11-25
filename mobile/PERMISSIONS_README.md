# Sistema de Permisos por Rol - Frontend Mobile

Este documento describe el sistema de permisos implementado en la aplicación móvil de Mesa de Servicios, basado en los roles de usuario y los endpoints disponibles en la API.

## 📋 Tabla de Contenidos

- [Roles de Usuario](#roles-de-usuario)
- [Permisos por Rol](#permisos-por-rol)
- [Implementación](#implementación)
- [Uso de Permisos](#uso-de-permisos)
- [Pantallas por Rol](#pantallas-por-rol)

## 👥 Roles de Usuario

El sistema define tres roles principales:

1. **Admin** - Administrador del sistema
2. **Technician** - Técnico de soporte
3. **User** - Usuario final

## 🔐 Permisos por Rol

### Administrador (Admin)

El administrador tiene acceso completo a todas las funcionalidades:

**Tickets:**

- ✅ Crear, ver, actualizar y eliminar todos los tickets
- ✅ Asignar tickets a técnicos
- ✅ Ver estadísticas completas

**Usuarios y Técnicos:**

- ✅ Gestión completa de usuarios
- ✅ Gestión completa de técnicos
- ✅ Ver carga de trabajo y desempeño

**Configuración:**

- ✅ Gestión de categorías
- ✅ Configuración de SLA
- ✅ Ver todos los reportes

**Base de Conocimientos:**

- ✅ Crear, editar y eliminar artículos

**Comentarios:**

- ✅ Agregar comentarios públicos e internos
- ✅ Ver comentarios internos

### Técnico (Technician)

El técnico tiene permisos enfocados en la gestión de tickets asignados:

**Tickets:**

- ✅ Crear tickets
- ✅ Ver tickets asignados a él
- ✅ Actualizar tickets asignados
- ✅ Ver estadísticas de tickets

**Trabajo Propio:**

- ✅ Ver su carga de trabajo
- ✅ Ver su desempeño
- ✅ Ver feedback recibido

**Base de Conocimientos:**

- ✅ Ver artículos
- ✅ Crear y editar artículos

**Comentarios:**

- ✅ Agregar comentarios públicos e internos
- ✅ Ver comentarios internos

**Reportes:**

- ✅ Ver reportes de tickets
- ✅ Ver reportes de SLA

### Usuario (User)

El usuario tiene permisos básicos para gestionar sus propios tickets:

**Tickets:**

- ✅ Crear tickets
- ✅ Ver solo sus propios tickets
- ✅ Agregar comentarios públicos

**Base de Conocimientos:**

- ✅ Ver artículos
- ✅ Marcar artículos como útiles

**Feedback:**

- ✅ Dar feedback en sus tickets resueltos

**Notificaciones:**

- ✅ Ver sus notificaciones

## 🛠️ Implementación

### Estructura de Archivos

```
mobile/
├── utils/
│   └── permissions.js          # Definición de permisos y roles
├── hooks/
│   └── usePermissions.js       # Hook para verificar permisos
├── components/
│   └── ProtectedComponent.js   # Componentes para proteger UI
└── screens/
    ├── Admin/                  # Pantallas exclusivas para Admin
    │   ├── UsersScreen.js
    │   └── ReportsScreen.js
    └── Technician/             # Pantallas exclusivas para Técnicos
        └── TechnicianDashboardScreen.js
```

### Archivos Principales

#### 1. `utils/permissions.js`

Define todos los permisos disponibles y los asigna a cada rol:

```javascript
export const PERMISSIONS = {
  CREATE_TICKET: "create_ticket",
  VIEW_ALL_TICKETS: "view_all_tickets",
  // ... más permisos
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    /* todos los permisos */
  ],
  [ROLES.TECHNICIAN]: [
    /* permisos de técnico */
  ],
  [ROLES.USER]: [
    /* permisos básicos */
  ],
};
```

#### 2. `hooks/usePermissions.js`

Hook personalizado para verificar permisos en componentes:

```javascript
const { can, isAdmin, isTechnician } = usePermissions();

if (can.viewAllTickets) {
  // Mostrar todos los tickets
}
```

#### 3. `components/ProtectedComponent.js`

Componentes para proteger UI basado en permisos:

```javascript
<ProtectedComponent permission={PERMISSIONS.VIEW_ALL_USERS}>
  <UsersManagementSection />
</ProtectedComponent>
```

## 📱 Uso de Permisos

### En Componentes

```javascript
import { usePermissions } from "../hooks/usePermissions";

const MyComponent = () => {
  const { can, isAdmin, isTechnician } = usePermissions();

  return (
    <View>
      {can.createTicket && <Button title="Crear Ticket" />}

      {can.viewAllUsers && <Button title="Gestionar Usuarios" />}

      {isAdmin && <AdminPanel />}
    </View>
  );
};
```

### Proteger Pantallas Completas

```javascript
import { ProtectedScreen } from "../components/ProtectedComponent";
import { PERMISSIONS } from "../utils/permissions";

const AdminScreen = ({ navigation }) => {
  return (
    <ProtectedScreen
      permission={PERMISSIONS.VIEW_ALL_USERS}
      navigation={navigation}
    >
      <View>{/* Contenido de la pantalla */}</View>
    </ProtectedScreen>
  );
};
```

### Con Higher Order Component

```javascript
import { withPermission } from "../components/ProtectedComponent";
import { PERMISSIONS } from "../utils/permissions";

const UsersScreen = () => {
  // ... componente
};

export default withPermission(UsersScreen, PERMISSIONS.VIEW_ALL_USERS);
```

## 🎨 Pantallas por Rol

### Admin

- **Dashboard**: Vista general con estadísticas completas
- **Tickets**: Todos los tickets del sistema
- **Usuarios**: Gestión de usuarios
- **Reportes**: Reportes completos (tickets, SLA, técnicos, incidentes)
- **Categorías**: Gestión de categorías
- **SLA**: Configuración de SLA

### Technician

- **Dashboard de Técnico**: Carga de trabajo y desempeño personal
- **Mis Tickets Asignados**: Tickets asignados al técnico
- **Base de Conocimientos**: Ver y crear artículos
- **Mi Feedback**: Feedback recibido

### User

- **Dashboard**: Vista de sus propios tickets
- **Mis Tickets**: Solo tickets creados por el usuario
- **Base de Conocimientos**: Vista de lectura
- **Crear Ticket**: Formulario de creación

## 🔄 Navegación Adaptativa

La navegación se adapta según el rol:

```javascript
const MainTabs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isTechnician = user?.role === "technician";

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Dashboard"
        component={isTechnician ? TechnicianDashboardScreen : DashboardScreen}
      />
      {/* Más tabs */}
      {isAdmin && <Tab.Screen name="Reports" component={ReportsScreen} />}
    </Tab.Navigator>
  );
};
```

## ✅ Verificaciones de Seguridad

### Nivel de Componente

Los componentes verifican permisos antes de renderizar:

```javascript
{
  can.deleteTicket && <Button onPress={handleDelete}>Eliminar</Button>;
}
```

### Nivel de Pantalla

Las pantallas verifican permisos al cargar:

```javascript
useEffect(() => {
  if (!can.viewAllUsers) {
    Alert.alert("Error", "No tienes permisos");
    navigation.goBack();
    return;
  }
  loadData();
}, []);
```

### Nivel de API

Los servicios solo realizan peticiones permitidas por el backend.

## 🎯 Ejemplos de Uso Común

### Verificar un permiso

```javascript
const { can } = usePermissions();

if (can.createTicket) {
  // Usuario puede crear tickets
}
```

### Verificar múltiples permisos (todos requeridos)

```javascript
const { checkAllPermissions, PERMISSIONS } = usePermissions();

if (
  checkAllPermissions([PERMISSIONS.VIEW_ALL_TICKETS, PERMISSIONS.ASSIGN_TICKET])
) {
  // Usuario puede ver y asignar tickets
}
```

### Verificar múltiples permisos (al menos uno)

```javascript
const { checkAnyPermission, PERMISSIONS } = usePermissions();

if (
  checkAnyPermission([
    PERMISSIONS.UPDATE_ANY_TICKET,
    PERMISSIONS.UPDATE_ASSIGNED_TICKET,
  ])
) {
  // Usuario puede editar al menos algunos tickets
}
```

### Verificar rol directamente

```javascript
const { isAdmin, isTechnician, isUser } = usePermissions();

if (isAdmin) {
  // Usuario es administrador
}
```

## 📚 Referencias

- Permisos definidos según endpoints de Postman Collection
- Basado en arquitectura de roles RBAC (Role-Based Access Control)
- Implementación client-side como primera capa de seguridad
- El backend valida todos los permisos en cada request

## 🔒 Notas de Seguridad

1. **Seguridad Client-Side**: Los permisos del frontend son solo para UX. El backend SIEMPRE valida permisos.
2. **Tokens**: El sistema usa JWT tokens con información del rol del usuario.
3. **Validación Doble**: Tanto frontend como backend verifican permisos.
4. **Principio de Menor Privilegio**: Los usuarios solo tienen acceso a lo que necesitan.

## 🚀 Mejoras Futuras

- [ ] Permisos granulares por recurso
- [ ] Sistema de permisos personalizados
- [ ] Auditoría de accesos
- [ ] Permisos temporales
- [ ] Roles personalizados por organización
