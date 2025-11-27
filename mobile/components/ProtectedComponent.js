import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { usePermissions } from "../hooks/usePermissions";

/**
 * Componente para proteger pantallas y componentes basado en permisos
 * @param {Object} props
 * @param {string|string[]} props.permission - Permiso o permisos requeridos
 * @param {boolean} props.requireAll - Si es true, requiere todos los permisos. Si es false, requiere al menos uno
 * @param {React.ReactNode} props.children - Contenido a mostrar si tiene permisos
 * @param {React.ReactNode} props.fallback - Contenido alternativo si no tiene permisos
 */
export const ProtectedComponent = ({
  permission,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { checkPermission, checkAllPermissions, checkAnyPermission } =
    usePermissions();

  let hasAccess = false;

  if (Array.isArray(permission)) {
    hasAccess = requireAll
      ? checkAllPermissions(permission)
      : checkAnyPermission(permission);
  } else {
    hasAccess = checkPermission(permission);
  }

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};

/**
 * Componente para proteger pantallas completas
 */
export const ProtectedScreen = ({
  permission,
  requireAll = false,
  children,
  navigation,
}) => {
  const { checkPermission, checkAllPermissions, checkAnyPermission } =
    usePermissions();

  let hasAccess = false;

  if (Array.isArray(permission)) {
    hasAccess = requireAll
      ? checkAllPermissions(permission)
      : checkAnyPermission(permission);
  } else {
    hasAccess = checkPermission(permission);
  }

  if (!hasAccess) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.title}>Acceso Denegado</Text>
          <Text style={styles.message}>
            No tienes permisos para acceder a esta sección.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

/**
 * Higher Order Component para proteger pantallas
 */
export const withPermission = (Component, permission, requireAll = false) => {
  return (props) => (
    <ProtectedScreen
      permission={permission}
      requireAll={requireAll}
      navigation={props.navigation}
    >
      <Component {...props} />
    </ProtectedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 300,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
