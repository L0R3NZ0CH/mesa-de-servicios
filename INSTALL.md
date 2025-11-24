# Guía de Instalación - Mesa de Servicios Backend

## Instalación con Docker (Recomendado)

### Paso 1: Clonar y configurar

```bash
# Clonar el repositorio
git clone <repository-url>
cd examenfinal_appmovil

# Crear archivo .env
cp .env.example .env
# Editar .env si es necesario (por defecto funciona con Docker)
```

### Paso 2: Levantar contenedores

```bash
# Construir y levantar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Paso 3: Inicializar usuario administrador

```bash
# Esperar a que MySQL esté listo (unos segundos)
# Luego ejecutar:
docker-compose exec app npm run init-admin
```

### Paso 4: Verificar

- API disponible en: http://localhost:3000
- MySQL disponible en: localhost:3306
- Credenciales por defecto:
  - Email: admin@mesaservicios.com
  - Password: Admin123!

## Instalación sin Docker

### Paso 1: Instalar dependencias

```bash
npm install
```

### Paso 2: Configurar base de datos

1. Crear base de datos MySQL:
```sql
CREATE DATABASE mesa_servicios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Ejecutar esquema:
```bash
mysql -u root -p mesa_servicios < data/schema.sql
```

### Paso 3: Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales de MySQL
```

### Paso 4: Inicializar usuario administrador

```bash
npm run init-admin
```

### Paso 5: Iniciar servidor

```bash
# Producción
npm start

# Desarrollo (con nodemon)
npm run dev
```

## Verificación

1. Verificar salud de la API:
```bash
curl http://localhost:3000/api/health
```

2. Probar login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mesaservicios.com","password":"Admin123!"}'
```

## Importar colección de Postman

1. Abrir Postman
2. File > Import
3. Seleccionar `postman_collection.json`
4. La colección incluye todos los endpoints con ejemplos

## Solución de Problemas

### Error de conexión a MySQL

- Verificar que MySQL esté corriendo
- Verificar credenciales en `.env`
- Verificar que el puerto 3306 esté disponible

### Error al inicializar administrador

- Asegurarse de que la base de datos esté creada
- Verificar que el esquema SQL se haya ejecutado correctamente
- Verificar variables de entorno en `.env`

### Puerto 3000 en uso

- Cambiar `PORT` en `.env`
- O detener el proceso que usa el puerto 3000

