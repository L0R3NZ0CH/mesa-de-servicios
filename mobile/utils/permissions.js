// Sistema de permisos basado en roles
// Basado en los endpoints disponibles en la Postman Collection

export const ROLES = {
  ADMIN: "admin",
  TECHNICIAN: "technician",
  USER: "user",
};

export const PERMISSIONS = {
  // Tickets
  CREATE_TICKET: "create_ticket",
  VIEW_ALL_TICKETS: "view_all_tickets",
  VIEW_OWN_TICKETS: "view_own_tickets",
  VIEW_ASSIGNED_TICKETS: "view_assigned_tickets",
  UPDATE_ANY_TICKET: "update_any_ticket",
  UPDATE_ASSIGNED_TICKET: "update_assigned_ticket",
  DELETE_TICKET: "delete_ticket",
  ASSIGN_TICKET: "assign_ticket",
  VIEW_TICKET_STATISTICS: "view_ticket_statistics",

  // Comentarios
  ADD_COMMENT: "add_comment",
  ADD_INTERNAL_COMMENT: "add_internal_comment",
  VIEW_INTERNAL_COMMENTS: "view_internal_comments",

  // Adjuntos
  UPLOAD_ATTACHMENT: "upload_attachment",

  // Usuarios
  VIEW_ALL_USERS: "view_all_users",
  CREATE_USER: "create_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",

  // Técnicos
  VIEW_TECHNICIANS: "view_technicians",
  CREATE_TECHNICIAN: "create_technician",
  UPDATE_TECHNICIAN: "update_technician",
  VIEW_TECHNICIAN_WORKLOAD: "view_technician_workload",
  VIEW_TECHNICIAN_PERFORMANCE: "view_technician_performance",
  VIEW_OWN_ASSIGNED_TICKETS: "view_own_assigned_tickets",

  // Categorías
  VIEW_CATEGORIES: "view_categories",
  CREATE_CATEGORY: "create_category",
  UPDATE_CATEGORY: "update_category",
  DELETE_CATEGORY: "delete_category",

  // Base de Conocimientos
  VIEW_KNOWLEDGE_BASE: "view_knowledge_base",
  CREATE_ARTICLE: "create_article",
  UPDATE_ARTICLE: "update_article",
  DELETE_ARTICLE: "delete_article",
  MARK_ARTICLE_HELPFUL: "mark_article_helpful",

  // Feedback
  CREATE_FEEDBACK: "create_feedback",
  VIEW_ALL_FEEDBACK: "view_all_feedback",
  VIEW_TECHNICIAN_FEEDBACK: "view_technician_feedback",
  VIEW_FEEDBACK_STATISTICS: "view_feedback_statistics",

  // Reportes
  VIEW_TICKET_REPORTS: "view_ticket_reports",
  VIEW_SLA_REPORTS: "view_sla_reports",
  VIEW_TECHNICIAN_REPORTS: "view_technician_reports",
  VIEW_INCIDENT_REPORTS: "view_incident_reports",

  // SLA
  VIEW_SLA_CONFIG: "view_sla_config",
  UPDATE_SLA_CONFIG: "update_sla_config",
  VIEW_SLA_COMPLIANCE: "view_sla_compliance",
  CHECK_TICKET_SLA: "check_ticket_sla",

  // Notificaciones
  VIEW_NOTIFICATIONS: "view_notifications",
  MARK_NOTIFICATION_READ: "mark_notification_read",
  DELETE_NOTIFICATION: "delete_notification",
};

// Definición de permisos por rol
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Tickets - Acceso completo
    PERMISSIONS.CREATE_TICKET,
    PERMISSIONS.VIEW_ALL_TICKETS,
    PERMISSIONS.VIEW_OWN_TICKETS,
    PERMISSIONS.UPDATE_ANY_TICKET,
    PERMISSIONS.DELETE_TICKET,
    PERMISSIONS.ASSIGN_TICKET,
    PERMISSIONS.VIEW_TICKET_STATISTICS,

    // Comentarios - Acceso completo
    PERMISSIONS.ADD_COMMENT,
    PERMISSIONS.ADD_INTERNAL_COMMENT,
    PERMISSIONS.VIEW_INTERNAL_COMMENTS,

    // Adjuntos
    PERMISSIONS.UPLOAD_ATTACHMENT,

    // Usuarios - Gestión completa
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,

    // Técnicos - Gestión completa
    PERMISSIONS.VIEW_TECHNICIANS,
    PERMISSIONS.CREATE_TECHNICIAN,
    PERMISSIONS.UPDATE_TECHNICIAN,
    PERMISSIONS.VIEW_TECHNICIAN_WORKLOAD,
    PERMISSIONS.VIEW_TECHNICIAN_PERFORMANCE,

    // Categorías - Gestión completa
    PERMISSIONS.VIEW_CATEGORIES,
    PERMISSIONS.CREATE_CATEGORY,
    PERMISSIONS.UPDATE_CATEGORY,
    PERMISSIONS.DELETE_CATEGORY,

    // Base de Conocimientos - Gestión completa
    PERMISSIONS.VIEW_KNOWLEDGE_BASE,
    PERMISSIONS.CREATE_ARTICLE,
    PERMISSIONS.UPDATE_ARTICLE,
    PERMISSIONS.DELETE_ARTICLE,
    PERMISSIONS.MARK_ARTICLE_HELPFUL,

    // Feedback - Ver todo
    PERMISSIONS.CREATE_FEEDBACK,
    PERMISSIONS.VIEW_ALL_FEEDBACK,
    PERMISSIONS.VIEW_TECHNICIAN_FEEDBACK,
    PERMISSIONS.VIEW_FEEDBACK_STATISTICS,

    // Reportes - Acceso completo
    PERMISSIONS.VIEW_TICKET_REPORTS,
    PERMISSIONS.VIEW_SLA_REPORTS,
    PERMISSIONS.VIEW_TECHNICIAN_REPORTS,
    PERMISSIONS.VIEW_INCIDENT_REPORTS,

    // SLA - Gestión completa
    PERMISSIONS.VIEW_SLA_CONFIG,
    PERMISSIONS.UPDATE_SLA_CONFIG,
    PERMISSIONS.VIEW_SLA_COMPLIANCE,
    PERMISSIONS.CHECK_TICKET_SLA,

    // Notificaciones
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.MARK_NOTIFICATION_READ,
    PERMISSIONS.DELETE_NOTIFICATION,
  ],

  [ROLES.TECHNICIAN]: [
    // Tickets - Solo asignados y estadísticas
    PERMISSIONS.CREATE_TICKET,
    PERMISSIONS.VIEW_ASSIGNED_TICKETS,
    PERMISSIONS.VIEW_OWN_TICKETS,
    PERMISSIONS.UPDATE_ASSIGNED_TICKET,
    PERMISSIONS.VIEW_TICKET_STATISTICS,
    PERMISSIONS.VIEW_OWN_ASSIGNED_TICKETS,

    // Comentarios - Incluye internos
    PERMISSIONS.ADD_COMMENT,
    PERMISSIONS.ADD_INTERNAL_COMMENT,
    PERMISSIONS.VIEW_INTERNAL_COMMENTS,

    // Adjuntos
    PERMISSIONS.UPLOAD_ATTACHMENT,

    // Técnicos - Ver y su propio desempeño
    PERMISSIONS.VIEW_TECHNICIANS,
    PERMISSIONS.VIEW_TECHNICIAN_WORKLOAD,
    PERMISSIONS.VIEW_TECHNICIAN_PERFORMANCE,

    // Categorías - Solo ver
    PERMISSIONS.VIEW_CATEGORIES,

    // Base de Conocimientos - Crear y editar
    PERMISSIONS.VIEW_KNOWLEDGE_BASE,
    PERMISSIONS.CREATE_ARTICLE,
    PERMISSIONS.UPDATE_ARTICLE,
    PERMISSIONS.MARK_ARTICLE_HELPFUL,

    // Feedback - Ver el suyo
    PERMISSIONS.VIEW_TECHNICIAN_FEEDBACK,

    // Reportes - Limitado
    PERMISSIONS.VIEW_TICKET_REPORTS,
    PERMISSIONS.VIEW_SLA_REPORTS,

    // SLA - Solo ver
    PERMISSIONS.VIEW_SLA_CONFIG,
    PERMISSIONS.VIEW_SLA_COMPLIANCE,
    PERMISSIONS.CHECK_TICKET_SLA,

    // Notificaciones
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.MARK_NOTIFICATION_READ,
    PERMISSIONS.DELETE_NOTIFICATION,
  ],

  [ROLES.USER]: [
    // Tickets - Solo propios
    PERMISSIONS.CREATE_TICKET,
    PERMISSIONS.VIEW_OWN_TICKETS,

    // Comentarios - Solo públicos
    PERMISSIONS.ADD_COMMENT,

    // Adjuntos
    PERMISSIONS.UPLOAD_ATTACHMENT,

    // Categorías - Solo ver
    PERMISSIONS.VIEW_CATEGORIES,

    // Base de Conocimientos - Solo lectura
    PERMISSIONS.VIEW_KNOWLEDGE_BASE,
    PERMISSIONS.MARK_ARTICLE_HELPFUL,

    // Feedback - Crear en sus tickets
    PERMISSIONS.CREATE_FEEDBACK,

    // Notificaciones
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.MARK_NOTIFICATION_READ,
    PERMISSIONS.DELETE_NOTIFICATION,
  ],
};

// Función para verificar si un rol tiene un permiso específico
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
};

// Función para verificar múltiples permisos (requiere todos)
export const hasAllPermissions = (role, permissions) => {
  if (!role || !permissions || !Array.isArray(permissions)) return false;
  return permissions.every((permission) => hasPermission(role, permission));
};

// Función para verificar múltiples permisos (requiere al menos uno)
export const hasAnyPermission = (role, permissions) => {
  if (!role || !permissions || !Array.isArray(permissions)) return false;
  return permissions.some((permission) => hasPermission(role, permission));
};

// Función para obtener todos los permisos de un rol
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// Funciones de ayuda para verificaciones comunes
export const canManageUsers = (role) =>
  hasPermission(role, PERMISSIONS.VIEW_ALL_USERS);
export const canManageTechnicians = (role) =>
  hasPermission(role, PERMISSIONS.CREATE_TECHNICIAN);
export const canManageCategories = (role) =>
  hasPermission(role, PERMISSIONS.CREATE_CATEGORY);
export const canViewReports = (role) =>
  hasPermission(role, PERMISSIONS.VIEW_TICKET_REPORTS);
export const canManageSLA = (role) =>
  hasPermission(role, PERMISSIONS.UPDATE_SLA_CONFIG);
export const canViewAllTickets = (role) =>
  hasPermission(role, PERMISSIONS.VIEW_ALL_TICKETS);
export const canAssignTickets = (role) =>
  hasPermission(role, PERMISSIONS.ASSIGN_TICKET);
export const canManageKnowledgeBase = (role) =>
  hasPermission(role, PERMISSIONS.CREATE_ARTICLE);
export const canViewInternalComments = (role) =>
  hasPermission(role, PERMISSIONS.VIEW_INTERNAL_COMMENTS);
export const canViewAllFeedback = (role) =>
  hasPermission(role, PERMISSIONS.VIEW_ALL_FEEDBACK);
