import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { ticketService, departmentService } from "../../services/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const IncidentHistoryScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { can, isAdmin } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    avgResponseTime: 0,
    avgResolutionTime: 0,
    slaCompliance: 0,
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment || !isAdmin) {
      loadTickets();
    }
  }, [selectedDepartment]);

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      if (response.success) {
        setDepartments(response.data.departments || []);
        // Si el usuario tiene departamento, seleccionarlo por defecto
        if (user?.department_id && !isAdmin) {
          setSelectedDepartment(user.department_id);
        }
      }
    } catch (error) {
      console.error("Error loading departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const filters = {};

      // Si no es admin, filtrar por departamento del usuario
      if (!isAdmin && user?.department_id) {
        filters.department_id = user.department_id;
      } else if (selectedDepartment) {
        filters.department_id = selectedDepartment;
      }

      const response = await ticketService.getAll(filters);
      if (response.success) {
        const ticketList = response.data.tickets || [];
        setTickets(ticketList);
        calculateStats(ticketList);
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (ticketList) => {
    const total = ticketList.length;
    let totalResponseTime = 0;
    let totalResolutionTime = 0;
    let responseCount = 0;
    let resolutionCount = 0;
    let slaCompliant = 0;

    ticketList.forEach((ticket) => {
      if (ticket.response_time && ticket.created_at) {
        const responseHours =
          (new Date(ticket.response_time) - new Date(ticket.created_at)) /
          (1000 * 60 * 60);
        totalResponseTime += responseHours;
        responseCount++;
      }

      if (ticket.resolution_time && ticket.created_at) {
        const resolutionHours =
          (new Date(ticket.resolution_time) - new Date(ticket.created_at)) /
          (1000 * 60 * 60);
        totalResolutionTime += resolutionHours;
        resolutionCount++;
      }

      if (!ticket.sla_breached) {
        slaCompliant++;
      }
    });

    setStats({
      total,
      avgResponseTime:
        responseCount > 0 ? (totalResponseTime / responseCount).toFixed(1) : 0,
      avgResolutionTime:
        resolutionCount > 0
          ? (totalResolutionTime / resolutionCount).toFixed(1)
          : 0,
      slaCompliance: total > 0 ? ((slaCompliant / total) * 100).toFixed(1) : 0,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const filterTickets = () => {
    if (!searchQuery) return tickets;

    const query = searchQuery.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.ticket_number?.toLowerCase().includes(query) ||
        ticket.title?.toLowerCase().includes(query) ||
        ticket.category_name?.toLowerCase().includes(query) ||
        ticket.incident_type_name?.toLowerCase().includes(query)
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "#2196F3",
      in_progress: "#FF9800",
      pending: "#9C27B0",
      resolved: "#4CAF50",
      closed: "#757575",
    };
    return colors[status] || "#666";
  };

  const getPriorityColor = (level) => {
    const colors = {
      1: "#388E3C", // Baja
      2: "#FBC02D", // Media
      3: "#F57C00", // Alta
      4: "#D32F2F", // Crítica
    };
    return colors[level] || "#666";
  };

  const getIncidentTypeIcon = (type) => {
    const icons = {
      hardware: "🖥️",
      software: "💻",
      network: "🌐",
      security: "🔒",
      other: "📋",
    };
    return icons[type?.toLowerCase()] || "📋";
  };

  const filteredTickets = filterTickets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Historial de Incidencias</Text>
        <Text style={styles.headerSubtitle}>
          {selectedDepartment
            ? departments.find((d) => d.id === selectedDepartment)?.name ||
              "Todos"
            : "Selecciona un departamento"}
        </Text>
      </View>

      {/* Selector de Departamento (solo para admin) */}
      {isAdmin && (
        <View style={styles.departmentSelector}>
          <Text style={styles.selectorLabel}>Departamento:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.departmentChip,
                !selectedDepartment && styles.departmentChipActive,
              ]}
              onPress={() => setSelectedDepartment(null)}
            >
              <Text
                style={[
                  styles.departmentChipText,
                  !selectedDepartment && styles.departmentChipTextActive,
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>
            {departments.map((dept) => (
              <TouchableOpacity
                key={dept.id}
                style={[
                  styles.departmentChip,
                  selectedDepartment === dept.id && styles.departmentChipActive,
                ]}
                onPress={() => setSelectedDepartment(dept.id)}
              >
                <Text
                  style={[
                    styles.departmentChipText,
                    selectedDepartment === dept.id &&
                      styles.departmentChipTextActive,
                  ]}
                >
                  {dept.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Incidencias</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#2196F3" }]}>
            {stats.avgResponseTime}h
          </Text>
          <Text style={styles.statLabel}>Resp. Promedio</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#FF9800" }]}>
            {stats.avgResolutionTime}h
          </Text>
          <Text style={styles.statLabel}>Resol. Promedio</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#4CAF50" }]}>
            {stats.slaCompliance}%
          </Text>
          <Text style={styles.statLabel}>SLA Cumplido</Text>
        </View>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar por número, título, categoría o tipo..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Lista de Tickets */}
      <View style={styles.ticketsList}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#2196F3" />
        ) : filteredTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No se encontraron incidencias"
                : "No hay incidencias registradas"}
            </Text>
          </View>
        ) : (
          filteredTickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={styles.ticketCard}
              onPress={() =>
                router.push({
                  pathname: "/ticket-detail",
                  params: { ticketId: ticket.id },
                })
              }
            >
              <View style={styles.ticketHeader}>
                <View style={styles.ticketHeaderLeft}>
                  <Text style={styles.ticketNumber}>
                    {ticket.ticket_number}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(ticket.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {ticket.status === "open"
                        ? "Abierto"
                        : ticket.status === "in_progress"
                        ? "En Proceso"
                        : ticket.status === "pending"
                        ? "Pendiente"
                        : ticket.status === "resolved"
                        ? "Resuelto"
                        : "Cerrado"}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    {
                      backgroundColor: getPriorityColor(ticket.priority_level),
                    },
                  ]}
                >
                  <Text style={styles.priorityText}>
                    {ticket.priority_name}
                  </Text>
                </View>
              </View>

              <Text style={styles.ticketTitle}>{ticket.title}</Text>

              <View style={styles.ticketMeta}>
                <Text style={styles.metaItem}>
                  📁 {ticket.category_name || "Sin categoría"}
                </Text>
                {ticket.incident_type_name && (
                  <Text style={styles.metaItem}>
                    {getIncidentTypeIcon(ticket.incident_type_name)}{" "}
                    {ticket.incident_type_name}
                  </Text>
                )}
              </View>

              <View style={styles.ticketFooter}>
                <Text style={styles.footerText}>
                  Creado:{" "}
                  {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", {
                    locale: es,
                  })}
                </Text>
                {ticket.resolution_time && (
                  <Text style={styles.footerText}>
                    Resuelto:{" "}
                    {format(
                      new Date(ticket.resolution_time),
                      "dd/MM/yyyy HH:mm",
                      { locale: es }
                    )}
                  </Text>
                )}
              </View>

              {ticket.sla_breached && (
                <View style={styles.slaWarning}>
                  <Text style={styles.slaWarningText}>⚠️ SLA Incumplido</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
  header: {
    backgroundColor: "#2196F3",
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E3F2FD",
  },
  departmentSelector: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  departmentChip: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  departmentChipActive: {
    backgroundColor: "#2196F3",
  },
  departmentChipText: {
    fontSize: 14,
    color: "#666",
  },
  departmentChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  searchContainer: {
    padding: 15,
    paddingTop: 0,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  ticketsList: {
    padding: 15,
    paddingTop: 0,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  ticketHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2196F3",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  ticketMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  metaItem: {
    fontSize: 12,
    color: "#666",
  },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 11,
    color: "#999",
    marginBottom: 2,
  },
  slaWarning: {
    backgroundColor: "#FFF3E0",
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  slaWarningText: {
    fontSize: 12,
    color: "#F57C00",
    fontWeight: "600",
  },
});

export default IncidentHistoryScreen;
