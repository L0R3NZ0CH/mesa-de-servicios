# Variables de Entorno - Mesa de Servicios

Este documento describe todas las variables de entorno necesarias para el proyecto.

## 📋 Backend - Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto backend con las siguientes variables:

### 🔧 Configuración del Servidor

```env
# Puerto en el que correrá el servidor
PORT=3000

# Entorno de ejecución (development, production, test)
NODE_ENV=development
```

### 🗄️ Configuración de Base de Datos

```env
# Host de MySQL
DB_HOST=localhost

# Puerto de MySQL
DB_PORT=3306

# Usuario de MySQL
DB_USER=root

# Contraseña de MySQL
DB_PASSWORD=rootpassword

# Nombre de la base de datos
DB_NAME=mesa_servicios
```

**Valores por defecto si no se especifican:**
- `DB_HOST`: `localhost`
- `DB_PORT`: `3306`
- `DB_USER`: `root`
- `DB_PASSWORD`: `rootpassword`
- `DB_NAME`: `mesa_servicios`

### 🔐 Configuración JWT (Autenticación)

```env
# Secreto para firmar los tokens JWT
# ⚠️ IMPORTANTE: Cambia esto en producción por un valor seguro y aleatorio
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Tiempo de expiración del token JWT
JWT_EXPIRES_IN=24h
```

**Valores por defecto si no se especifican:**
- `JWT_SECRET`: `your-super-secret-jwt-key-change-in-production`
- `JWT_EXPIRES_IN`: `24h`

**Formatos válidos para JWT_EXPIRES_IN:**
- `24h` - 24 horas
- `7d` - 7 días
- `30d` - 30 días
- `3600` - 3600 segundos

### 📁 Configuración de Archivos

```env
# Directorio donde se guardarán los archivos subidos
UPLOAD_DIR=./uploads

# Tamaño máximo de archivo en bytes (por defecto 10MB)
MAX_FILE_SIZE=10485760
```

**Valores por defecto si no se especifican:**
- `UPLOAD_DIR`: `./uploads`
- `MAX_FILE_SIZE`: `10485760` (10MB)

**Conversión de tamaños:**
- 1MB = 1048576 bytes
- 5MB = 5242880 bytes
- 10MB = 10485760 bytes
- 20MB = 20971520 bytes

### 📧 Configuración de Email (Opcional)

```env
# Host del servidor SMTP
EMAIL_HOST=smtp.gmail.com

# Puerto del servidor SMTP
EMAIL_PORT=587

# Usuario del email
EMAIL_USER=your-email@gmail.com

# Contraseña del email
EMAIL_PASSWORD=your-email-password
```

**Nota:** Estas variables son opcionales y se usarán cuando se implemente el envío de emails.

## 📱 Frontend Móvil - Configuración

El frontend móvil no usa variables de entorno tradicionales, sino que se configura directamente en el código.

### Configuración en `mobile/config/api.js`

```javascript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Desarrollo local
  : 'https://your-api-domain.com/api'; // Producción
```

**Configuraciones según el entorno:**

1. **Android Emulador:**
   ```javascript
   export const API_BASE_URL = 'http://10.0.2.2:3000/api';
   ```

2. **iOS Simulador:**
   ```javascript
   export const API_BASE_URL = 'http://localhost:3000/api';
   ```

3. **Dispositivo Físico:**
   ```javascript
   export const API_BASE_URL = 'http://192.168.1.100:3000/api';
   // Reemplaza 192.168.1.100 con la IP de tu máquina
   ```

## 🐳 Docker - Variables de Entorno

Si usas Docker Compose, las variables se pueden definir en `docker-compose.yml`:

```yaml
environment:
  NODE_ENV: development
  PORT: 3000
  DB_HOST: mysql
  DB_PORT: 3306
  DB_USER: root
  DB_PASSWORD: rootpassword
  DB_NAME: mesa_servicios
  JWT_SECRET: your-super-secret-jwt-key-change-in-production
  JWT_EXPIRES_IN: 24h
```

## 📝 Archivo .env de Ejemplo

Crea un archivo `.env` en la raíz del proyecto backend:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=mesa_servicios

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Email Configuration (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## 🔒 Seguridad - Variables Sensibles

### ⚠️ Variables que DEBES cambiar en producción:

1. **JWT_SECRET**: 
   - Genera un secreto seguro y aleatorio
   - Puedes usar: `openssl rand -base64 32`
   - Nunca compartas este valor

2. **DB_PASSWORD**:
   - Usa una contraseña fuerte
   - No uses la contraseña por defecto en producción

3. **EMAIL_PASSWORD**:
   - Si usas Gmail, genera una "Contraseña de aplicación"
   - No uses tu contraseña principal

### ✅ Buenas Prácticas:

1. **Nunca subas el archivo `.env` a Git**
   - Ya está incluido en `.gitignore`

2. **Usa diferentes valores para desarrollo y producción**

3. **Rota las contraseñas periódicamente**

4. **Usa variables de entorno del sistema en producción** (no archivos .env)

## 🚀 Configuración Rápida

### Desarrollo Local:

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tus valores locales

3. Inicia el servidor:
   ```bash
   npm start
   ```

### Producción:

1. Configura las variables en tu plataforma de hosting:
   - Heroku: `heroku config:set VARIABLE=value`
   - AWS: Usa AWS Systems Manager Parameter Store
   - Docker: Define en `docker-compose.yml` o usa archivos `.env`

2. Asegúrate de cambiar todos los valores por defecto

## 📊 Resumen de Variables

| Variable | Requerida | Por Defecto | Descripción |
|----------|-----------|-------------|-------------|
| `PORT` | No | `3000` | Puerto del servidor |
| `NODE_ENV` | No | `development` | Entorno de ejecución |
| `DB_HOST` | No | `localhost` | Host de MySQL |
| `DB_PORT` | No | `3306` | Puerto de MySQL |
| `DB_USER` | No | `root` | Usuario de MySQL |
| `DB_PASSWORD` | No | `rootpassword` | Contraseña de MySQL |
| `DB_NAME` | No | `mesa_servicios` | Nombre de la BD |
| `JWT_SECRET` | **Sí** | (valor inseguro) | Secreto para JWT |
| `JWT_EXPIRES_IN` | No | `24h` | Expiración del token |
| `UPLOAD_DIR` | No | `./uploads` | Directorio de uploads |
| `MAX_FILE_SIZE` | No | `10485760` | Tamaño max archivo |
| `EMAIL_HOST` | No | - | Host SMTP (opcional) |
| `EMAIL_PORT` | No | - | Puerto SMTP (opcional) |
| `EMAIL_USER` | No | - | Usuario email (opcional) |
| `EMAIL_PASSWORD` | No | - | Contraseña email (opcional) |

## 🔍 Verificar Variables de Entorno

Para verificar que las variables están cargadas correctamente, puedes agregar temporalmente en `server.js`:

```javascript
console.log('Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
// ... etc
```

**Nota:** Elimina estos console.log antes de producción.

