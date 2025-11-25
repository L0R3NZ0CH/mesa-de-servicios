// Hook personalizado para gestionar permisos del usuario
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  canManageUsers,
  canManageTechnicians,
  canManageCategories,
  canViewReports,
  canManageSLA,
  canViewAllTickets,
  canAssignTickets,
  canManageKnowledgeBase,
  canViewInternalComments,
  canViewAllFeedback,
  PERMISSIONS,
  ROLES,
} from "../utils/permissions";

export const usePermissions = () => {
  const { user } = useAuth();
  const userRole = user?.role;

  // Memoizar los permisos del usuario
  const permissions = useMemo(() => {
    if (!userRole) return [];
    return getRolePermissions(userRole);
  }, [userRole]);

  // Función para verificar un permiso específico
  const checkPermission = (permission) => {
    return hasPermission(userRole, permission);
  };

  // Función para verificar múltiples permisos (todos requeridos)
  const checkAllPermissions = (permissionList) => {
    return hasAllPermissions(userRole, permissionList);
  };

  // Función para verificar múltiples permisos (al menos uno)
  const checkAnyPermission = (permissionList) => {
    return hasAnyPermission(userRole, permissionList);
  };

  // Verificaciones rápidas comunes
  const can = useMemo(
    () => ({
      // Tickets
      createTicket: checkPermission(PERMISSIONS.CREATE_TICKET),
      viewAllTickets: checkPermission(PERMISSIONS.VIEW_ALL_TICKETS),
      viewOwnTickets: checkPermission(PERMISSIONS.VIEW_OWN_TICKETS),
      viewAssignedTickets: checkPermission(PERMISSIONS.VIEW_ASSIGNED_TICKETS),
      updateAnyTicket: checkPermission(PERMISSIONS.UPDATE_ANY_TICKET),
      updateAssignedTicket: checkPermission(PERMISSIONS.UPDATE_ASSIGNED_TICKET),
      deleteTicket: checkPermission(PERMISSIONS.DELETE_TICKET),
      assignTicket: checkPermission(PERMISSIONS.ASSIGN_TICKET),
      viewTicketStatistics: checkPermission(PERMISSIONS.VIEW_TICKET_STATISTICS),

      // Comentarios
      addComment: checkPermission(PERMISSIONS.ADD_COMMENT),
      addInternalComment: checkPermission(PERMISSIONS.ADD_INTERNAL_COMMENT),
      viewInternalComments: checkPermission(PERMISSIONS.VIEW_INTERNAL_COMMENTS),

      // Adjuntos
      uploadAttachment: checkPermission(PERMISSIONS.UPLOAD_ATTACHMENT),

      // Usuarios
      viewAllUsers: checkPermission(PERMISSIONS.VIEW_ALL_USERS),
      createUser: checkPermission(PERMISSIONS.CREATE_USER),
      updateUser: checkPermission(PERMISSIONS.UPDATE_USER),
      deleteUser: checkPermission(PERMISSIONS.DELETE_USER),
      manageUsers: canManageUsers(userRole),

      // Técnicos
      viewTechnicians: checkPermission(PERMISSIONS.VIEW_TECHNICIANS),
      createTechnician: checkPermission(PERMISSIONS.CREATE_TECHNICIAN),
      updateTechnician: checkPermission(PERMISSIONS.UPDATE_TECHNICIAN),
      viewTechnicianWorkload: checkPermission(
        PERMISSIONS.VIEW_TECHNICIAN_WORKLOAD
      ),
      viewTechnicianPerformance: checkPermission(
        PERMISSIONS.VIEW_TECHNICIAN_PERFORMANCE
      ),
      viewOwnAssignedTickets: checkPermission(
        PERMISSIONS.VIEW_OWN_ASSIGNED_TICKETS
      ),
      manageTechnicians: canManageTechnicians(userRole),

      // Categorías
      viewCategories: checkPermission(PERMISSIONS.VIEW_CATEGORIES),
      createCategory: checkPermission(PERMISSIONS.CREATE_CATEGORY),
      updateCategory: checkPermission(PERMISSIONS.UPDATE_CATEGORY),
      deleteCategory: checkPermission(PERMISSIONS.DELETE_CATEGORY),
      manageCategories: canManageCategories(userRole),

      // Base de Conocimientos
      viewKnowledgeBase: checkPermission(PERMISSIONS.VIEW_KNOWLEDGE_BASE),
      createArticle: checkPermission(PERMISSIONS.CREATE_ARTICLE),
      updateArticle: checkPermission(PERMISSIONS.UPDATE_ARTICLE),
      deleteArticle: checkPermission(PERMISSIONS.DELETE_ARTICLE),
      markArticleHelpful: checkPermission(PERMISSIONS.MARK_ARTICLE_HELPFUL),
      manageKnowledgeBase: canManageKnowledgeBase(userRole),

      // Feedback
      createFeedback: checkPermission(PERMISSIONS.CREATE_FEEDBACK),
      viewAllFeedback: checkPermission(PERMISSIONS.VIEW_ALL_FEEDBACK),
      viewTechnicianFeedback: checkPermission(
        PERMISSIONS.VIEW_TECHNICIAN_FEEDBACK
      ),
      viewFeedbackStatistics: checkPermission(
        PERMISSIONS.VIEW_FEEDBACK_STATISTICS
      ),

      // Reportes
      viewTicketReports: checkPermission(PERMISSIONS.VIEW_TICKET_REPORTS),
      viewSLAReports: checkPermission(PERMISSIONS.VIEW_SLA_REPORTS),
      viewTechnicianReports: checkPermission(
        PERMISSIONS.VIEW_TECHNICIAN_REPORTS
      ),
      viewIncidentReports: checkPermission(PERMISSIONS.VIEW_INCIDENT_REPORTS),
      viewReports: canViewReports(userRole),

      // SLA
      viewSLAConfig: checkPermission(PERMISSIONS.VIEW_SLA_CONFIG),
      updateSLAConfig: checkPermission(PERMISSIONS.UPDATE_SLA_CONFIG),
      viewSLACompliance: checkPermission(PERMISSIONS.VIEW_SLA_COMPLIANCE),
      checkTicketSLA: checkPermission(PERMISSIONS.CHECK_TICKET_SLA),
      manageSLA: canManageSLA(userRole),

      // Notificaciones
      viewNotifications: checkPermission(PERMISSIONS.VIEW_NOTIFICATIONS),
      markNotificationRead: checkPermission(PERMISSIONS.MARK_NOTIFICATION_READ),
      deleteNotification: checkPermission(PERMISSIONS.DELETE_NOTIFICATION),
    }),
    [userRole]
  );

  // Información del rol
  const isAdmin = userRole === ROLES.ADMIN;
  const isTechnician = userRole === ROLES.TECHNICIAN;
  const isUser = userRole === ROLES.USER;

  return {
    permissions,
    checkPermission,
    checkAllPermissions,
    checkAnyPermission,
    can,
    isAdmin,
    isTechnician,
    isUser,
    userRole,
    PERMISSIONS,
    ROLES,
  };
};
