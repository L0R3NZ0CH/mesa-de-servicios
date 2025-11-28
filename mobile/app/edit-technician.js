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
import { technicianService, departmentService } from "../services/api";

const EditTechnicianScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { can } = usePermissions();
  const technicianId = params?.technicianId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    specialty: "",
    schedule_start: "",
    schedule_end: "",
    max_tickets: 10,
  });

  useEffect(() => {
    if (!can.updateTechnician) {
      Alert.alert("Error", "No tienes permisos para editar técnicos");
      router.back();
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [techResponse, deptResponse] = await Promise.all([
        technicianService.getById(technicianId),
        departmentService.getAll(),
      ]);

      if (techResponse.success && techResponse.data.technician) {
        const tech = techResponse.data.technician;
        setFormData({
          specialty: tech.specialty || "",
          schedule_start: tech.schedule_start || "",
          schedule_end: tech.schedule_end || "",
          max_tickets: tech.max_tickets || 10,
        });
      } else {
        Alert.alert("Error", "No se pudo cargar el técnico");
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
    if (!formData.specialty) {
      Alert.alert("Error", "La especialidad es obligatoria");
      return;
    }

    setSaving(true);
    try {
      const result = await technicianService.update(technicianId, formData);

      if (result.success) {
        Alert.alert("Éxito", "Técnico actualizado exitosamente");
        router.back();
      } else {
        Alert.alert("Error", result.message || "Error al actualizar técnico");
      }
    } catch (error) {
      console.error("Error updating technician:", error);
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
        <Text style={styles.title}>Editar Técnico</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Especialidad *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Hardware, Software, Redes"
            value={formData.specialty}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, specialty: value }))
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hora de Inicio</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM (Ej: 08:00)"
            value={formData.schedule_start}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, schedule_start: value }))
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hora de Fin</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM (Ej: 17:00)"
            value={formData.schedule_end}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, schedule_end: value }))
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Máximo de Tickets</Text>
          <TextInput
            style={styles.input}
            placeholder="10"
            value={formData.max_tickets?.toString()}
            onChangeText={(value) =>
              setFormData((prev) => ({
                ...prev,
                max_tickets: parseInt(value) || 10,
              }))
            }
            keyboardType="numeric"
          />
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

export default EditTechnicianScreen;
