import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Picker,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { usePermissions } from "../hooks/usePermissions";
import { userService, departmentService } from "../services/api";

const EditUserScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { can } = usePermissions();
  const userId = params?.userId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    department_id: null,
    role: "user",
  });

  useEffect(() => {
    if (!can.updateUser) {
      Alert.alert("Error", "No tienes permisos para editar usuarios");
      router.back();
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userResponse, deptResponse] = await Promise.all([
        userService.getById(userId),
        departmentService.getAll(),
      ]);

      if (userResponse.success && userResponse.data.user) {
        const user = userResponse.data.user;
        setFormData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          phone: user.phone || "",
          department_id: user.department_id || null,
          role: user.role || "user",
        });
      } else {
        Alert.alert("Error", "No se pudo cargar el usuario");
        router.back();
      }

      if (deptResponse.success) {
        setDepartments(deptResponse.data.departments || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "No se pudo cargar la información");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name) {
      Alert.alert("Error", "El nombre y apellido son obligatorios");
      return;
    }

    setSaving(true);
    try {
      const result = await userService.update(userId, formData);

      if (result.success) {
        Alert.alert("Éxito", "Usuario actualizado exitosamente");
        router.back();
      } else {
        Alert.alert("Error", result.message || "Error al actualizar usuario");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Error de conexión. Verifica tu conexión a internet."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Editar Usuario</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={formData.first_name}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, first_name: value }))
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Apellido *</Text>
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            value={formData.last_name}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, last_name: value }))
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="Número de teléfono"
            value={formData.phone}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, phone: value }))
            }
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Departamento</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.department_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, department_id: value }))
              }
              style={styles.picker}
            >
              <Picker.Item label="Sin departamento" value={null} />
              {departments.map((dept) => (
                <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Rol</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
              style={styles.picker}
            >
              <Picker.Item label="Usuario" value="user" />
              <Picker.Item label="Técnico" value="technician" />
              <Picker.Item label="Administrador" value="admin" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, saving && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditUserScreen;
