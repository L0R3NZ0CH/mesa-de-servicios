# Migración: Sistema de Tracking de Artículos

## Descripción
Esta migración agrega el sistema de tracking por usuario para la base de conocimientos:
- **Una vista por usuario**: Cada usuario solo registra una vista por artículo
- **Un like por usuario**: Cada usuario solo puede dar like una vez por artículo

## Tablas Creadas

### `article_views`
Registra las vistas únicas de artículos por usuario.
- `id`: ID autoincremental
- `article_id`: Referencia al artículo (FK → knowledge_base)
- `user_id`: Referencia al usuario (FK → users)
- `viewed_at`: Timestamp de la vista
- **Constraint único**: `(article_id, user_id)` - Un usuario solo puede registrar una vista por artículo

### `article_likes`
Registra los likes únicos de artículos por usuario.
- `id`: ID autoincremental
- `article_id`: Referencia al artículo (FK → knowledge_base)
- `user_id`: Referencia al usuario (FK → users)
- `liked_at`: Timestamp del like
- **Constraint único**: `(article_id, user_id)` - Un usuario solo puede dar like una vez por artículo

## Cómo Ejecutar la Migración

### Opción 1: MySQL CLI
```bash
mysql -u root -p mesa_servicios < scripts/migrate-article-tracking.sql
```

### Opción 2: MySQL Workbench
1. Abrir MySQL Workbench
2. Conectarse a la base de datos
3. Abrir el archivo `scripts/migrate-article-tracking.sql`
4. Ejecutar el script (⚡ botón de ejecutar)

### Opción 3: Docker (si usas contenedor)
```bash
docker exec -i mysql-container mysql -u root -p mesa_servicios < scripts/migrate-article-tracking.sql
```

## Cambios en el Backend

### `models/KnowledgeBase.js`
- `findById()`: Ahora recibe `userId` y registra la vista solo una vez
- `incrementHelpful()`: Ahora recibe `userId` y valida que no haya dado like previamente

### `controllers/knowledgeBaseController.js`
- `getById()`: Pasa `req.user.id` al modelo
- `markHelpful()`: Pasa `req.user.id` y retorna 409 si ya dio like

## Cambios en el Frontend

### `screens/KnowledgeBase/ArticleDetailScreen.js`
- Muestra estado del like (verde ✓ si ya dio like)
- Deshabilita botón de "útil" si ya marcó el artículo
- **NUEVO**: Botón de eliminar artículo (solo para admin)
- Maneja errores 409 (conflicto) cuando intenta dar like duplicado

### `services/api.js`
- **NUEVO**: `knowledgeBaseService.delete(id)` - Eliminar artículo

## Validaciones Implementadas

### Backend
✅ Un usuario solo puede ver un artículo una vez (incrementa views solo primera vez)
✅ Un usuario solo puede dar like una vez (INSERT con UNIQUE constraint)
✅ Error 409 si intenta dar like duplicado
✅ Solo admin puede eliminar artículos

### Frontend
✅ Botón de like cambia a verde cuando ya dio like
✅ Botón deshabilitado después del primer like
✅ Mensaje claro: "Ya marcaste como útil"
✅ Botón de eliminar solo visible para admin
✅ Confirmación antes de eliminar

## Pruebas

1. **Vista única por usuario**:
   - Abrir un artículo por primera vez → contador de vistas aumenta
   - Recargar la página → contador NO aumenta

2. **Like único por usuario**:
   - Dar like → contador aumenta, botón se pone verde
   - Intentar dar like nuevamente → mensaje "Ya marcaste como útil"

3. **Admin puede eliminar**:
   - Login como admin → ver artículo → botón "🗑️ Eliminar Artículo" visible
   - Login como usuario → botón NO visible

## Rollback (si es necesario)

```sql
USE mesa_servicios;
DROP TABLE IF EXISTS article_likes;
DROP TABLE IF EXISTS article_views;
```

⚠️ **Nota**: Esto eliminará todos los registros de vistas y likes.
