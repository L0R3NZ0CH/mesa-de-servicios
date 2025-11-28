# 📊 Módulo de Gestión de Incidencias

## Descripción General

El módulo de gestión de incidencias proporciona un sistema completo para el registro, clasificación, seguimiento y resolución de incidentes de TI. Incluye escalación automática por SLA y análisis detallado por departamento y cliente.

## Características Implementadas ✅

### 1. Registro de Incidencias

- ✅ Registro completo con fecha, hora y detalles
- ✅ Campos: título, descripción, prioridad, categoría, tipo de incidente
- ✅ Adjuntos de evidencia (imágenes, documentos)
- ✅ Auto-generación de número de ticket único
- ✅ Asignación automática por especialidad del técnico

### 2. Clasificación por Tipo

- ✅ Tipos predefinidos: Hardware, Software, Network, Security
- ✅ CRUD completo de tipos de incidente (solo administradores)
- ✅ Estadísticas por tipo de incidente
- ✅ Validación: no se puede eliminar tipo con tickets asociados
- ✅ Endpoints: `/api/incident-types`

### 3. Tiempos de Respuesta y Resolución

- ✅ Registro automático de `response_time` (primera interacción)
- ✅ Registro automático de `resolution_time` (al cerrar)
- ✅ Cálculo de tiempos promedio por prioridad
- ✅ Deadlines basados en SLA configurado por prioridad
- ✅ Campos: `sla_response_deadline`, `sla_resolution_deadline`

### 4. Escalación Automática ⚡

- ✅ Sistema automatizado con `node-cron`
- ✅ Verificación cada 5 minutos
- ✅ Escalación por SLA de respuesta vencido
- ✅ Escalación por SLA de resolución vencido
- ✅ Marca automática: `sla_breached = TRUE`, `sla_escalated = TRUE`
- ✅ Notificaciones a:
  - Técnico asignado
  - Usuario creador
  - Todos los administradores
- ✅ Comentario interno automático con detalles
- ✅ Registro en `ticket_history`
- ✅ Auto-reasignación de tickets críticos no asignados
- ✅ Reporte diario a las 8:00 AM

### 5. Historial de Incidencias

#### 5.1 Historial por Departamento (Admin)

- ✅ Vista completa por departamento
- ✅ Selector de departamento con chips
- ✅ Estadísticas agregadas:
  - Total de incidencias
  - Tiempo promedio de respuesta
  - Tiempo promedio de resolución
  - % Cumplimiento SLA
- ✅ Buscador por número, título, categoría, tipo
- ✅ Filtros visuales por estado y prioridad
- ✅ Indicadores de SLA incumplido
- ✅ Pull-to-refresh
- ✅ Ruta: `/incident-history`

#### 5.2 Historial por Cliente (Usuario)

- ✅ Vista personal de todas las incidencias del usuario
- ✅ Estadísticas personales:
  - Total de tickets
  - Tickets activos
  - Tickets cerrados
  - Tiempo promedio de resolución
- ✅ Información del técnico asignado
- ✅ Fechas de creación y resolución
- ✅ Clasificación por tipo (icono visual)
- ✅ Alertas de SLA incumplido
- ✅ Ruta: `/my-incidents`

## Estructura de Base de Datos

### Tabla `tickets`

```sql
CREATE TABLE tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'pending', 'resolved', 'closed'),
  priority_id INT NOT NULL,
  category_id INT NOT NULL,
  incident_type_id INT,
  created_by INT NOT NULL,
  assigned_to INT,
  response_time TIMESTAMP NULL,
  resolution_time TIMESTAMP NULL,
  sla_response_deadline TIMESTAMP NULL,
  sla_resolution_deadline TIMESTAMP NULL,
  sla_breached BOOLEAN DEFAULT FALSE,
  sla_escalated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_type_id) REFERENCES incident_types(id),
  INDEX idx_tickets_sla_escalation (status, sla_breached, sla_response_deadline, sla_resolution_deadline)
);
```

### Tabla `incident_types`

```sql
CREATE TABLE incident_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

### Tipos de Incidente

#### GET `/api/incident-types`

Obtener todos los tipos de incidente

```json
{
  "success": true,
  "data": {
    "incident_types": [
      {
        "id": 1,
        "name": "Hardware",
        "description": "Problemas de hardware"
      }
    ]
  }
}
```

#### GET `/api/incident-types/:id`

Obtener tipo con estadísticas

```json
{
  "success": true,
  "data": {
    "incident_type": {
      "id": 1,
      "name": "Hardware",
      "statistics": {
        "total_tickets": 45,
        "closed_tickets": 30,
        "active_tickets": 15,
        "avg_resolution_hours": 12.5,
        "sla_breached_count": 3
      }
    }
  }
}
```

#### POST `/api/incident-types` (Admin)

Crear nuevo tipo

```json
{
  "name": "Security",
  "description": "Incidentes de seguridad"
}
```

#### PUT `/api/incident-types/:id` (Admin)

Actualizar tipo

#### DELETE `/api/incident-types/:id` (Admin)

Eliminar tipo (valida que no tenga tickets)

### Tickets

#### GET `/api/tickets`

Filtros disponibles:

- `created_by`: ID del usuario
- `assigned_to`: ID del técnico
- `status`: open, in_progress, pending, resolved, closed
- `priority_level`: 1-4
- `category_id`: ID de categoría
- `incident_type_id`: ID de tipo

## Servicios Backend

### SLAEscalationService

Ubicación: `services/slaEscalationService.js`

**Métodos:**

- `checkAndEscalateTickets()`: Proceso principal de escalación
- `findResponseSLAViolations()`: Busca tickets con respuesta vencida
- `findResolutionSLAViolations()`: Busca tickets con resolución vencida
- `escalateTicket(ticket, type)`: Escala un ticket individual
- `attemptAutoReassignment(connection, ticket)`: Intenta reasignar tickets críticos
- `getEscalationStats(startDate, endDate)`: Estadísticas de escalaciones

**Proceso de escalación:**

1. Marca `sla_breached = TRUE` y `sla_escalated = TRUE`
2. Registra en `ticket_history`
3. Agrega comentario interno automático
4. Notifica a técnico, usuario y administradores
5. Auto-asigna si es crítico/alto y sin técnico

### SchedulerService

Ubicación: `services/schedulerService.js`

**Trabajos programados:**

1. **SLA Check** - Cada 5 minutos
   - Verifica y escala tickets con SLA vencido
2. **Daily Report** - 8:00 AM
   - Genera reporte de escalaciones del día anterior

**Métodos:**

- `start()`: Inicia todos los trabajos
- `stop()`: Detiene todos los trabajos
- `getStatus()`: Estado de los trabajos

## Pantallas Frontend

### IncidentHistoryScreen (Admin)

**Ubicación:** `mobile/screens/Admin/IncidentHistoryScreen.js`
**Ruta:** `/incident-history`

**Características:**

- Selector de departamento
- 4 estadísticas principales
- Buscador en tiempo real
- Lista de tickets con badges
- Pull-to-refresh
- Navegación a detalle

**Permisos:** Solo administradores o usuarios filtrados por su departamento

### UserIncidentHistoryScreen

**Ubicación:** `mobile/screens/Dashboard/UserIncidentHistoryScreen.js`
**Ruta:** `/my-incidents`

**Características:**

- Vista personal de tickets
- 4 estadísticas del usuario
- Lista cronológica
- Indicadores de estado y técnico
- Alertas de SLA

**Permisos:** Todos los usuarios autenticados

## Frontend Services

### incidentTypeService

**Ubicación:** `mobile/services/api.js`

```javascript
incidentTypeService.getAll();
incidentTypeService.getById(id);
incidentTypeService.create(data); // Admin
incidentTypeService.update(id, data); // Admin
incidentTypeService.delete(id); // Admin
```

## Configuración

### Variables de Entorno

```env
# Ya configuradas en .env
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=mesa_servicios
PORT=3000
```

### Inicio del Sistema

El scheduler se inicia automáticamente al levantar el servidor:

```javascript
// server.js
const schedulerService = require("./services/schedulerService");

app.listen(PORT, () => {
  schedulerService.start(); // ✅ Se inicia automáticamente
});
```

## Scripts de Instalación

### Agregar columna y índices

```bash
docker exec -i mesa_servicios_db mysql -uroot -prootpassword mesa_servicios < scripts/add-sla-escalation.sql
```

El script:

- ✅ Agrega `sla_escalated` si no existe
- ✅ Crea índice para consultas de escalación
- ✅ Actualiza tickets existentes con SLA incumplido

## Flujo de Escalación

```
┌─────────────────────────────────────────────────────────┐
│  Cron Job (cada 5 minutos)                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
     ┌───────────────────────────────────┐
     │ checkAndEscalateTickets()         │
     └───────────┬───────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│ Response SLA │  │ Resolution SLA   │
│ Violations   │  │ Violations       │
└──────┬───────┘  └────────┬─────────┘
       │                   │
       └────────┬──────────┘
                │
                ▼
       ┌─────────────────┐
       │ escalateTicket() │
       └────────┬─────────┘
                │
       ┌────────┴──────────────────────┐
       │                               │
       ▼                               ▼
┌─────────────┐              ┌──────────────────┐
│ Update DB   │              │ Send             │
│ - sla_breach│              │ Notifications    │
│ - sla_escal │              │ - Technician     │
│ - history   │              │ - User           │
│ - comment   │              │ - Admins         │
└─────────────┘              └──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Auto-reassign if needed │
│ (critical/high only)    │
└─────────────────────────┘
```

## Uso en la Aplicación

### Para Usuarios

1. Ver historial personal en Dashboard → "Mis Incidencias"
2. Ver todas las incidencias creadas
3. Ver estado actual de cada ticket
4. Ver técnico asignado
5. Ver alertas de SLA

### Para Técnicos

1. Reciben notificaciones de escalaciones
2. Pueden ver tickets escalados en su dashboard
3. Comentarios automáticos con información de escalación

### Para Administradores

1. Ver historial completo por departamento
2. Selector de departamento para análisis
3. Estadísticas agregadas en tiempo real
4. Gestión de tipos de incidente
5. Reciben todas las notificaciones de escalación
6. Dashboard con métricas de SLA

## Monitoreo y Logs

### Verificar estado del scheduler

```bash
docker logs mesa_servicios_app | grep -A 5 "trabajos programados"
```

**Output esperado:**

```
🕐 Iniciando trabajos programados...
✅ 2 trabajos programados iniciados
   - SLA Check
   - Daily Report
```

### Ver ejecuciones de escalación

```bash
docker logs mesa_servicios_app | grep "verificación de SLA"
```

### Ver tickets escalados

```sql
SELECT ticket_number, title, priority_level, sla_escalated, sla_breached
FROM tickets
WHERE sla_escalated = TRUE
ORDER BY updated_at DESC;
```

## Mejoras Futuras Sugeridas

1. **Notificaciones por Email**

   - Enviar emails automáticos en escalaciones
   - Resumen diario por email

2. **Dashboard de Escalaciones**

   - Pantalla dedicada a tickets escalados
   - Gráficos de tendencias

3. **Configuración de Horarios**

   - Ajustar frecuencia de verificación
   - Excluir fines de semana/festivos

4. **Reportes Avanzados**

   - Exportar historial a PDF
   - Gráficos de tipos de incidente más comunes

5. **Webhooks**
   - Integración con Slack/Teams
   - Alertas externas

## Testing

### Probar escalación manual

```javascript
// Ejecutar en consola de Node.js
const slaEscalationService = require("./services/slaEscalationService");
slaEscalationService
  .checkAndEscalateTickets()
  .then(() => console.log("✅ Escalación completada"))
  .catch((err) => console.error("❌ Error:", err));
```

### Crear ticket de prueba con SLA vencido

```sql
-- Insertar ticket con SLA ya vencido
INSERT INTO tickets (
  ticket_number, title, description, status, priority_id,
  category_id, created_by, sla_response_deadline, sla_resolution_deadline
) VALUES (
  'TEST-001', 'Ticket de prueba', 'Para probar escalación', 'open', 4,
  1, 2, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)
);

-- Esperar 5 minutos y verificar
SELECT * FROM tickets WHERE ticket_number = 'TEST-001';
-- Debe tener sla_escalated = 1 y sla_breached = 1
```

## Soporte

Para reportar problemas o sugerir mejoras en el módulo de gestión de incidencias, contactar al equipo de desarrollo.

---

**Última actualización:** $(date)
**Versión del módulo:** 1.0.0
**Estado:** ✅ Producción
