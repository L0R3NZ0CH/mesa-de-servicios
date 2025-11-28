import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { ticketService } from "../../services/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const UserIncidentHistoryScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    avgResolutionTime: 0,
  });

  useEffect(() => {
    loadUserTickets();
  }, []);

  const loadUserTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getAll({ created_by: user.id });
      if (response.success) {
        const ticketList = response.data.tickets || [];
        setTickets(ticketList);
        calculateStats(ticketList);
      }
    } catch (error) {
      console.error("Error loading user tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketList) => {
    const total = ticketList.length;
    const open = ticketList.filter((t) =>
      ["open", "in_progress", "pending"].includes(t.status)
    ).length;
    const closed = ticketList.filter((t) => t.status === "closed").length;

    let totalResolutionTime = 0;
    let resolutionCount = 0;

    ticketList.forEach((ticket) => {
      if (ticket.resolution_time && ticket.created_at) {
        const hours =
          (new Date(ticket.resolution_time) - new Date(ticket.created_at)) /
          (1000 * 60 * 60);
        totalResolutionTime += hours;
        resolutionCount++;
      }
    });

    setStats({
      total,
      open,
      closed,
      avgResolutionTime:
        resolutionCount > 0
          ? (totalResolutionTime / resolutionCount).toFixed(1)
          : 0,
    });
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Mis Incidencias</Text>
        <Text style={styles.headerSubtitle}>
          Historial de todos tus tickets
        </Text>
      </View>

      {/* Estadísticas del Usuario */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#FF9800" }]}>
            {stats.open}
          </Text>
          <Text style={styles.statLabel}>Activas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#4CAF50" }]}>
            {stats.closed}
          </Text>
          <Text style={styles.statLabel}>Cerradas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#2196F3" }]}>
            {stats.avgResolutionTime}h
          </Text>
          <Text style={styles.statLabel}>T. Resolución</Text>
        </View>
      </View>

      {/* Lista de Tickets */}
      <View style={styles.ticketsList}>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" />
        ) : tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No tienes incidencias registradas
            </Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketNumber}>{ticket.ticket_number}</Text>
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
                {ticket.assigned_technician && (
                  <Text style={styles.footerText}>
                    Asignado a: {ticket.assigned_technician}
                  </Text>
                )}
                {ticket.resolution_time && (
                  <Text style={[styles.footerText, { color: "#4CAF50" }]}>
                    ✓ Resuelto:{" "}
                    {format(
                      new Date(ticket.resolution_time),
                      "dd/MM/yyyy HH:mm",
                      {
                        locale: es,
                      }
                    )}
                  </Text>
                )}
              </View>

              {ticket.sla_breached && (
                <View style={styles.slaWarning}>
                  <Text style={styles.slaWarningText}>⚠️ SLA Incumplido</Text>
                </View>
              )}
            </View>
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
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "22%",
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
    fontSize: 11,
    color: "#666",
    textAlign: "center",
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
    alignItems: "center",
    marginBottom: 10,
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

export default UserIncidentHistoryScreen;
