import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/api";
import { setAuthToken, setLogoutCallback } from "../services/api";

const AuthContext = createContext({});

const TOKEN_KEY = "@auth_token";
const USER_KEY = "@auth_user";
const CREDENTIALS_KEY = "saved_credentials";
const REMEMBER_ME_KEY = "@remember_me";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Cargar sesión al iniciar la app
  useEffect(() => {
    loadStoredAuth();

    // Registrar callback para logout automático en caso de 401
    // IMPORTANTE: No debe limpiar las credenciales guardadas
    setLogoutCallback(() => {
      logout();
    });
  }, []);

  const loadStoredAuth = async () => {
    try {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);

        // Configurar token en el cliente API
        setAuthToken(storedToken);

        // Intentar refrescar el perfil del usuario
        try {
          const response = await authService.getProfile();
          if (response.success && response.data) {
            // Token válido, actualizar con datos frescos
            setUser(response.data.user);
            setToken(storedToken);
            setIsAuthenticated(true);

            // Actualizar datos en storage
            await AsyncStorage.setItem(
              USER_KEY,
              JSON.stringify(response.data.user)
            );
          } else {
            throw new Error("Token inválido");
          }
        } catch (error) {
          // Token expirado o inválido, limpiar sesión
          console.log("Token expirado, limpiando sesión");
          await clearStoredAuth();
        }
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      await clearStoredAuth();
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  const clearStoredAuth = async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      setAuthToken(null);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error clearing stored auth:", error);
    }
  };

  const saveCredentials = async (email, password) => {
    try {
      const credentials = JSON.stringify({ email, password });
      await AsyncStorage.setItem(CREDENTIALS_KEY, credentials);
      await AsyncStorage.setItem(REMEMBER_ME_KEY, "true");
      console.log("Credenciales guardadas:", email);
      return true;
    } catch (error) {
      console.error("Error saving credentials:", error);
      return false;
    }
  };

  const getSavedCredentials = async () => {
    try {
      const rememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      console.log("RememberMe flag:", rememberMe);
      if (rememberMe === "true") {
        const credentialsStr = await AsyncStorage.getItem(CREDENTIALS_KEY);
        console.log("Credenciales recuperadas:", credentialsStr ? "Sí" : "No");
        if (credentialsStr) {
          return JSON.parse(credentialsStr);
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting saved credentials:", error);
      return null;
    }
  };

  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem(CREDENTIALS_KEY);
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      console.log("Credenciales eliminadas");
    } catch (error) {
      console.error("Error clearing saved credentials:", error);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await authService.login(email, password);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;

        // Guardar en memoria
        setAuthToken(newToken);
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);

        // Persistir en AsyncStorage
        try {
          await AsyncStorage.setItem(TOKEN_KEY, newToken);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        } catch (storageError) {
          console.error("Error saving to storage:", storageError);
        }

        // Guardar o limpiar credenciales según rememberMe
        if (rememberMe) {
          await saveCredentials(email, password);
        } else {
          await clearSavedCredentials();
        }

        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: response.message || "Error en el login",
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al iniciar sesión";
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al registrar usuario";
      return { success: false, message };
    }
  };

  const logout = async () => {
    // Limpiar sesión completa
    await clearStoredAuth();
  };

  const updateUser = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success && response.data) {
        const updatedUser = response.data.user;
        setUser(updatedUser);

        // Actualizar en AsyncStorage
        try {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        } catch (storageError) {
          console.error("Error updating user in storage:", storageError);
        }

        return { success: true, data: updatedUser };
      }
      return { success: false, message: response.message };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al actualizar perfil";
      return { success: false, message };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);

        // Actualizar en AsyncStorage
        try {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        } catch (storageError) {
          console.error("Error updating user in storage:", storageError);
        }

        return userData;
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      // Si falla el refresh, puede ser token expirado
      if (error.response?.status === 401) {
        await logout();
      }
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    initializing,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    getSavedCredentials,
    clearSavedCredentials,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};
