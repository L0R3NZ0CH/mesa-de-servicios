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
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import {
  ticketService,
  technicianService,
  categoryService,
  incidentTypeService,
} from "../../services/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const AdvancedTicketSearchScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { can, isAdmin } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [categories, setCategories] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: null, // open, in_progress, pending, resolved, closed
    priority: null, // 1, 2, 3, 4
    assigned_to: null, // ID del técnico
    category_id: null,
    incident_type_id: null,
    date_from: null,
    date_to: null,
    sla_breached: null, // true/false
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTickets(),
        loadTechnicians(),
        loadCategories(),
        loadIncidentTypes(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const apiFilters = {};

      // Construir filtros para la API
      if (filters.status) apiFilters.status = filters.status;
      if (filters.priority) apiFilters.priority_level = filters.priority;
      if (filters.assigned_to) apiFilters.assigned_to = filters.assigned_to;
      if (filters.category_id) apiFilters.category_id = filters.category_id;
      if (filters.incident_type_id)
        apiFilters.incident_type_id = filters.incident_type_id;
      if (filters.sla_breached !== null)
        apiFilters.sla_breached = filters.sla_breached;

      const response = await ticketService.getAll(apiFilters);
      if (response.success) {
        let ticketList = response.data.tickets || [];

        // Filtros de fecha (frontend)
        if (filters.date_from) {
          const fromDate = new Date(filters.date_from);
          ticketList = ticketList.filter(
            (t) => new Date(t.created_at) >= fromDate
          );
        }
        if (filters.date_to) {
          const toDate = new Date(filters.date_to);
          toDate.setHours(23, 59, 59, 999);
          ticketList = ticketList.filter(
            (t) => new Date(t.created_at) <= toDate
          );
        }

        setTickets(ticketList);
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const response = await technicianService.getAll();
      if (response.success) {
        setTechnicians(response.data.technicians || []);
      }
    } catch (error) {
      console.error("Error loading technicians:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll();
      if (response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadIncidentTypes = async () => {
    try {
      const response = await incidentTypeService.getAll();
      if (response.success) {
        setIncidentTypes(response.data.incident_types || []);
      }
    } catch (error) {
      console.error("Error loading incident types:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const applyFilters = () => {
    setShowFilters(false);
    loadTickets();
  };

  const clearFilters = () => {
    setFilters({
      status: null,
      priority: null,
      assigned_to: null,
      category_id: null,
      incident_type_id: null,
      date_from: null,
      date_to: null,
      sla_breached: null,
    });
    setSearchQuery("");
    loadTickets();
  };

  const filterTicketsBySearch = () => {
    if (!searchQuery) return tickets;

    const query = searchQuery.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.ticket_number?.toLowerCase().includes(query) ||
        ticket.title?.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query) ||
        ticket.category_name?.toLowerCase().includes(query) ||
        ticket.incident_type_name?.toLowerCase().includes(query) ||
        ticket.assigned_technician?.toLowerCase().includes(query)
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

  const getStatusText = (status) => {
    const texts = {
      open: "Abierto",
      in_progress: "En Proceso",
      pending: "Pendiente",
      resolved: "Resuelto",
      closed: "Cerrado",
    };
    return texts[status] || status;
  };

  const getPriorityColor = (level) => {
    const colors = {
      1: "#388E3C",
      2: "#FBC02D",
      3: "#F57C00",
      4: "#D32F2F",
    };
    return colors[level] || "#666";
  };

  const getPriorityText = (level) => {
    const texts = {
      1: "Baja",
      2: "Media",
      3: "Alta",
      4: "Crítica",
    };
    return texts[level] || "Sin prioridad";
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

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((v) => v !== null).length;
  };

  const filteredTickets = filterTicketsBySearch();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Búsqueda Avanzada</Text>
        <Text style={styles.headerSubtitle}>
          {filteredTickets.length} ticket(s) encontrado(s)
        </Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar por número, título, descripción, técnico..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>
            {getActiveFiltersCount() > 0
              ? `Filtros (${getActiveFiltersCount()})`
              : "Filtros"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFilters}
        >
          {filters.status && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>
                Estado: {getStatusText(filters.status)}
              </Text>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, status: null })}
              >
                <Text style={styles.activeFilterRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.priority && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>
                Prioridad: {getPriorityText(filters.priority)}
              </Text>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, priority: null })}
              >
                <Text style={styles.activeFilterRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.assigned_to && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>
                Técnico:{" "}
                {
                  technicians.find((t) => t.user_id === filters.assigned_to)
                    ?.first_name
                }
              </Text>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, assigned_to: null })}
              >
                <Text style={styles.activeFilterRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.category_id && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>
                Categoría:{" "}
                {categories.find((c) => c.id === filters.category_id)?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, category_id: null })}
              >
                <Text style={styles.activeFilterRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.sla_breached !== null && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>
                {filters.sla_breached ? "SLA Incumplido" : "SLA OK"}
              </Text>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, sla_breached: null })}
              >
                <Text style={styles.activeFilterRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersText}>Limpiar todo</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Lista de Tickets */}
      <ScrollView
        style={styles.ticketsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" />
        ) : filteredTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || getActiveFiltersCount() > 0
                ? "No se encontraron tickets con los criterios de búsqueda"
                : "No hay tickets registrados"}
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
                      {getStatusText(ticket.status)}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    {
                      backgroundColor: getPriorityColor(
                        ticket.priority_level || ticket.priority_id
                      ),
                    },
                  ]}
                >
                  <Text style={styles.priorityText}>
                    {ticket.priority_name ||
                      getPriorityText(
                        ticket.priority_level || ticket.priority_id
                      )}
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
                {ticket.assigned_technician && (
                  <Text style={styles.metaItem}>
                    👤 {ticket.assigned_technician}
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
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal de Filtros */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros Avanzados</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Estado */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Estado:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.status === null && styles.filterChipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, status: null })}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.status === null && styles.filterChipTextActive,
                      ]}
                    >
                      Todos
                    </Text>
                  </TouchableOpacity>
                  {["open", "in_progress", "pending", "resolved", "closed"].map(
                    (status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.filterChip,
                          filters.status === status && styles.filterChipActive,
                        ]}
                        onPress={() => setFilters({ ...filters, status })}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            filters.status === status &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          {getStatusText(status)}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>

              {/* Prioridad */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Prioridad:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.priority === null && styles.filterChipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, priority: null })}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.priority === null &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      Todas
                    </Text>
                  </TouchableOpacity>
                  {[1, 2, 3, 4].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.filterChip,
                        filters.priority === priority &&
                          styles.filterChipActive,
                      ]}
                      onPress={() => setFilters({ ...filters, priority })}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.priority === priority &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {getPriorityText(priority)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Técnico */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Técnico Asignado:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.assigned_to === null && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, assigned_to: null })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.assigned_to === null &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      Todos
                    </Text>
                  </TouchableOpacity>
                  {technicians.map((tech) => (
                    <TouchableOpacity
                      key={tech.user_id}
                      style={[
                        styles.filterChip,
                        filters.assigned_to === tech.user_id &&
                          styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setFilters({ ...filters, assigned_to: tech.user_id })
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.assigned_to === tech.user_id &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {tech.first_name} {tech.last_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Categoría */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Categoría:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.category_id === null && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, category_id: null })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.category_id === null &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      Todas
                    </Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.filterChip,
                        filters.category_id === cat.id &&
                          styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setFilters({ ...filters, category_id: cat.id })
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.category_id === cat.id &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Tipo de Incidente */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Tipo de Incidente:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.incident_type_id === null &&
                        styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, incident_type_id: null })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.incident_type_id === null &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      Todos
                    </Text>
                  </TouchableOpacity>
                  {incidentTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.filterChip,
                        filters.incident_type_id === type.id &&
                          styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setFilters({ ...filters, incident_type_id: type.id })
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.incident_type_id === type.id &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {getIncidentTypeIcon(type.name)} {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* SLA */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Estado SLA:</Text>
                <View style={styles.filterRow}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.sla_breached === null && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, sla_breached: null })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.sla_breached === null &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      Todos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.sla_breached === false && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, sla_breached: false })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.sla_breached === false &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      ✅ SLA OK
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.sla_breached === true && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, sla_breached: true })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.sla_breached === true &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      ⚠️ SLA Incumplido
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  searchContainer: {
    flexDirection: "row",
    padding: 15,
    gap: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  filterButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  filterButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  activeFilters: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  activeFilterChip: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    alignItems: "center",
  },
  activeFilterText: {
    fontSize: 12,
    color: "#1976D2",
    marginRight: 6,
  },
  activeFilterRemove: {
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "bold",
  },
  clearFiltersButton: {
    backgroundColor: "#FF5252",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearFiltersText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  ticketsList: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
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
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalClose: {
    fontSize: 24,
    color: "#666",
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterChip: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  filterChipActive: {
    backgroundColor: "#2196F3",
  },
  filterChipText: {
    fontSize: 14,
    color: "#666",
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default AdvancedTicketSearchScreen;
