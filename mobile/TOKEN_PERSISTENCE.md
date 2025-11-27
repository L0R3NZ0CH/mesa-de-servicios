# Persistencia de Sesión JWT

Este documento explica cómo funciona el sistema de persistencia de sesión con JWT en la aplicación móvil.

## 🔐 Funcionamiento

### 1. **Login - Guardar Token**

Cuando el usuario inicia sesión:

```javascript
const login = async (email, password) => {
  const response = await authService.login(email, password);

  if (response.success) {
    const { token, user } = response.data;

    // 1. Guardar en memoria (estado React)
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);

    // 2. Configurar token en cliente API
    setAuthToken(token);

    // 3. Persistir en AsyncStorage
    await AsyncStorage.setItem("@auth_token", token);
    await AsyncStorage.setItem("@auth_user", JSON.stringify(user));
  }
};
```

### 2. **Inicio de App - Restaurar Sesión**

Al iniciar la aplicación:

```javascript
const loadStoredAuth = async () => {
  // 1. Leer token y usuario de AsyncStorage
  const storedToken = await AsyncStorage.getItem("@auth_token");
  const storedUser = await AsyncStorage.getItem("@auth_user");

  if (storedToken && storedUser) {
    // 2. Configurar token en cliente API
    setAuthToken(storedToken);

    // 3. Validar token con el backend
    try {
      const response = await authService.getProfile();

      if (response.success) {
        // Token válido - restaurar sesión
        setUser(response.data.user);
        setToken(storedToken);
        setIsAuthenticated(true);

        // Actualizar datos frescos en storage
        await AsyncStorage.setItem(
          "@auth_user",
          JSON.stringify(response.data.user)
        );
      }
    } catch (error) {
      // Token inválido o expirado - limpiar sesión
      await clearStoredAuth();
    }
  }
};
```

### 3. **Token Expirado - Logout Automático**

Si el token expira durante el uso:

```javascript
// Interceptor de API
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      authToken = null;

      // Limpiar AsyncStorage
      await AsyncStorage.multiRemove(["@auth_token", "@auth_user"]);

      // Ejecutar callback de logout
      if (onLogoutCallback) {
        onLogoutCallback();
      }
    }
    return Promise.reject(error);
  }
);
```

### 4. **Logout Manual**

Cuando el usuario cierra sesión:

```javascript
const logout = async () => {
  // 1. Limpiar estado
  setAuthToken(null);
  setToken(null);
  setUser(null);
  setIsAuthenticated(false);

  // 2. Limpiar AsyncStorage
  await AsyncStorage.multiRemove(["@auth_token", "@auth_user"]);
};
```

## 📦 Almacenamiento

### AsyncStorage Keys

- `@auth_token` - Token JWT
- `@auth_user` - Datos del usuario (JSON)

### Ejemplo de datos almacenados

```json
{
  "@auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "@auth_user": "{\"id\":1,\"email\":\"admin@example.com\",\"role\":\"admin\",...}"
}
```

## 🔄 Flujo de Estados

```
App Inicia
    ↓
Inicializando (loading: true)
    ↓
Leer AsyncStorage
    ↓
¿Token existe? ─── No ──→ Mostrar Login
    ↓ Sí
Validar con Backend
    ↓
¿Token válido? ─── No ──→ Limpiar + Mostrar Login
    ↓ Sí
Restaurar Sesión
    ↓
Usuario Autenticado
```

## 🛡️ Seguridad

### 1. **Validación en Cada Inicio**

El token se valida con el backend al iniciar la app:

```javascript
// Llamada a /auth/profile para verificar token
const response = await authService.getProfile();
```

### 2. **Interceptor de Errores 401**

Cualquier respuesta 401 limpia automáticamente la sesión:

```javascript
if (error.response?.status === 401) {
  await clearStoredAuth();
}
```

### 3. **Datos Sincronizados**

Los datos del usuario se actualizan en AsyncStorage cuando cambian:

```javascript
const updateUser = async (profileData) => {
  const response = await authService.updateProfile(profileData);

  if (response.success) {
    setUser(response.data.user);

    // Actualizar en AsyncStorage
    await AsyncStorage.setItem(
      "@auth_user",
      JSON.stringify(response.data.user)
    );
  }
};
```

## 💡 Pantalla de Carga

Mientras se valida el token:

```javascript
const AppNavigator = () => {
  const { isAuthenticated, loading, initializing } = useAuth();

  if (loading || initializing) {
    return (
      <View style={styles.splashScreen}>
        <Text>Mesa de Servicios</Text>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
```

## 🔧 Manejo de Errores

### Token Expirado

```javascript
try {
  const response = await ticketService.getAll();
} catch (error) {
  if (error.response?.status === 401) {
    // El interceptor ya limpió la sesión
    // El usuario será redirigido al login automáticamente
  }
}
```

### Error de Red

```javascript
try {
  const response = await authService.getProfile();
} catch (error) {
  if (!error.response) {
    // Error de red, mantener sesión local
    console.log("Error de conexión, usando datos locales");
  }
}
```

## 📱 Experiencia de Usuario

### Escenarios

1. **Primera vez**: Usuario ve login
2. **Login exitoso**: Token guardado, navega a la app
3. **Cierra y abre app**: Ve splash → Valida token → Entra directo (sin login)
4. **Token expirado**: Limpia sesión → Vuelve a login
5. **Sin internet**: Usa datos locales (si están frescos)
6. **Logout manual**: Limpia todo → Vuelve a login

## ⚙️ Configuración

### AuthContext

```javascript
const TOKEN_KEY = "@auth_token";
const USER_KEY = "@auth_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // ... resto del código
};
```

### API Service

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";

let authToken = null;
let onLogoutCallback = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const setLogoutCallback = (callback) => {
  onLogoutCallback = callback;
};
```

## 🚀 Ventajas

✅ Usuario no necesita login cada vez que abre la app
✅ Sesión persiste entre reinicios
✅ Token se valida automáticamente
✅ Logout automático si token expira
✅ Datos sincronizados entre memoria y storage
✅ Experiencia fluida y profesional

## ⚠️ Consideraciones

- AsyncStorage es asíncrono
- El token se valida en cada inicio
- Los errores 401 limpian automáticamente la sesión
- El backend siempre valida el token (seguridad real)
- La persistencia es solo para mejorar UX, no para seguridad

## 🔗 Archivos Relacionados

- `context/AuthContext.js` - Manejo de autenticación
- `services/api.js` - Cliente HTTP con interceptores
- `App.js` - Navegación y splash screen
- `config/api.js` - URL del backend

## 📝 Ejemplo Completo de Uso

```javascript
// En cualquier pantalla
import { useAuth } from "../context/AuthContext";

const MyScreen = () => {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();

  const handleRefresh = async () => {
    await refreshUser(); // Actualiza datos del usuario
  };

  const handleLogout = async () => {
    await logout(); // Cierra sesión y limpia storage
  };

  return (
    <View>
      <Text>Hola {user?.first_name}</Text>
      <Button onPress={handleRefresh}>Actualizar</Button>
      <Button onPress={handleLogout}>Cerrar Sesión</Button>
    </View>
  );
};
```
