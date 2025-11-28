const { pool } = require("../config/database");
const Notification = require("../models/Notification");

/**
 * Sistema de Escalación Automática de Tickets
 * Verifica tickets que han excedido sus SLA y los escala automáticamente
 */

class SLAEscalationService {
  /**
   * Ejecuta el proceso de escalación de tickets
   */
  async checkAndEscalateTickets() {
    console.log("🔍 Iniciando verificación de escalación de tickets...");

    try {
      // 1. Buscar tickets que han excedido el deadline de respuesta
      const responseViolations = await this.findResponseSLAViolations();
      console.log(
        `📊 Encontrados ${responseViolations.length} tickets con SLA de respuesta vencido`
      );

      for (const ticket of responseViolations) {
        await this.escalateTicket(ticket, "response");
      }

      // 2. Buscar tickets que han excedido el deadline de resolución
      const resolutionViolations = await this.findResolutionSLAViolations();
      console.log(
        `📊 Encontrados ${resolutionViolations.length} tickets con SLA de resolución vencido`
      );

      for (const ticket of resolutionViolations) {
        await this.escalateTicket(ticket, "resolution");
      }

      console.log("✅ Proceso de escalación completado");
    } catch (error) {
      console.error("❌ Error en proceso de escalación:", error);
      throw error;
    }
  }

  /**
   * Encuentra tickets que han excedido el SLA de respuesta
   */
  async findResponseSLAViolations() {
    const [tickets] = await pool.query(
      `
      SELECT 
        t.id,
        t.ticket_number,
        t.title,
        t.created_by,
        t.assigned_to,
        t.priority_id,
        p.level as priority_level,
        t.sla_response_deadline,
        t.sla_escalated,
        u.first_name,
        u.last_name,
        u.email,
        p.name as priority_name
      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN priorities p ON t.priority_id = p.id
      WHERE t.status IN ('open', 'in_progress', 'pending')
        AND t.response_time IS NULL
        AND t.sla_response_deadline < NOW()
        AND t.sla_breached = FALSE
      ORDER BY t.sla_response_deadline ASC
    `
    );

    return tickets;
  }

  /**
   * Encuentra tickets que han excedido el SLA de resolución
   */
  async findResolutionSLAViolations() {
    const [tickets] = await pool.query(
      `
      SELECT 
        t.id,
        t.ticket_number,
        t.title,
        t.created_by,
        t.assigned_to,
        t.priority_id,
        p.level as priority_level,
        t.sla_resolution_deadline,
        t.sla_escalated,
        u.first_name,
        u.last_name,
        u.email,
        p.name as priority_name
      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN priorities p ON t.priority_id = p.id
      WHERE t.status IN ('open', 'in_progress', 'pending')
        AND t.resolution_time IS NULL
        AND t.sla_resolution_deadline < NOW()
        AND t.sla_breached = FALSE
      ORDER BY t.sla_resolution_deadline ASC
    `
    );

    return tickets;
  }

  /**
   * Escala un ticket individual
   */
  async escalateTicket(ticket, violationType) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Marcar el ticket como SLA incumplido
      await connection.query(
        `UPDATE tickets 
         SET sla_breached = TRUE,
             sla_escalated = TRUE,
             updated_at = NOW()
         WHERE id = ?`,
        [ticket.id]
      );

      // 2. Registrar en ticket_history
      await connection.query(
        `INSERT INTO ticket_history (ticket_id, field_name, old_value, new_value, changed_by)
         VALUES (?, ?, ?, ?, ?)`,
        [
          ticket.id,
          "sla_status",
          "compliant",
          `breached_${violationType}`,
          null, // Sistema automático
        ]
      );

      // 3. Agregar comentario interno automático
      await connection.query(
        `INSERT INTO comments (ticket_id, comment, is_internal, commented_by)
         VALUES (?, ?, TRUE, ?)`,
        [
          ticket.id,
          `⚠️ ESCALACIÓN AUTOMÁTICA: SLA de ${
            violationType === "response" ? "respuesta" : "resolución"
          } vencido. Deadline: ${
            violationType === "response"
              ? ticket.sla_response_deadline
              : ticket.sla_resolution_deadline
          }`,
          ticket.assigned_to || ticket.created_by,
        ]
      );

      // 4. Notificar al técnico asignado (si existe)
      if (ticket.assigned_to) {
        await Notification.create({
          user_id: ticket.assigned_to,
          title: "⚠️ Ticket escalado por SLA",
          message: `El ticket ${ticket.ticket_number} ha sido escalado automáticamente por incumplimiento de SLA de ${violationType}`,
          type: "sla_breach",
          related_entity: "ticket",
          related_id: ticket.id,
        });
      }

      // 5. Notificar al usuario creador
      await Notification.create({
        user_id: ticket.created_by,
        title: "Su ticket ha sido escalado",
        message: `El ticket ${ticket.ticket_number} ha sido escalado por prioridad debido al tiempo de espera`,
        type: "sla_breach",
        related_entity: "ticket",
        related_id: ticket.id,
      });

      // 6. Notificar a todos los administradores
      const [admins] = await connection.query(
        `SELECT id FROM users WHERE role = 'admin'`
      );

      for (const admin of admins) {
        await Notification.create({
          user_id: admin.id,
          title: "🚨 Ticket escalado por SLA",
          message: `El ticket ${ticket.ticket_number} (${ticket.priority_name}) requiere atención urgente - SLA de ${violationType} vencido`,
          type: "sla_breach",
          related_entity: "ticket",
          related_id: ticket.id,
        });
      }

      // 7. Si el ticket es de prioridad crítica o alta y no tiene técnico, intentar auto-asignación
      if (
        (ticket.priority_level === 4 || ticket.priority_level === 3) &&
        !ticket.assigned_to
      ) {
        await this.attemptAutoReassignment(connection, ticket);
      }

      await connection.commit();

      console.log(
        `✅ Ticket ${ticket.ticket_number} escalado por ${violationType} SLA`
      );
    } catch (error) {
      await connection.rollback();
      console.error(
        `❌ Error escalando ticket ${ticket.ticket_number}:`,
        error
      );
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Intenta reasignar tickets críticos no asignados
   */
  async attemptAutoReassignment(connection, ticket) {
    try {
      // Buscar técnicos disponibles con menor carga de trabajo
      const [availableTechnicians] = await connection.query(
        `
        SELECT 
          t.user_id,
          u.first_name,
          u.last_name,
          t.max_tickets,
          COUNT(tk.id) as current_tickets
        FROM technicians t
        INNER JOIN users u ON t.user_id = u.id
        LEFT JOIN tickets tk ON tk.assigned_to = t.user_id 
          AND tk.status IN ('open', 'in_progress', 'pending')
        WHERE u.is_active = TRUE
        GROUP BY t.user_id, u.first_name, u.last_name, t.max_tickets
        HAVING current_tickets < t.max_tickets
        ORDER BY current_tickets ASC
        LIMIT 1
      `
      );

      if (availableTechnicians.length > 0) {
        const technician = availableTechnicians[0];

        // Reasignar el ticket
        await connection.query(
          `UPDATE tickets 
           SET assigned_to = ?,
               status = 'in_progress',
               updated_at = NOW()
           WHERE id = ?`,
          [technician.user_id, ticket.id]
        );

        // Notificar al nuevo técnico
        await Notification.create({
          user_id: technician.user_id,
          title: "🚨 Ticket crítico auto-asignado",
          message: `Se te ha asignado automáticamente el ticket ${ticket.ticket_number} debido a escalación por SLA`,
          type: "ticket_assigned",
          related_entity: "ticket",
          related_id: ticket.id,
        });

        console.log(
          `✅ Ticket ${ticket.ticket_number} auto-asignado a ${technician.first_name} ${technician.last_name}`
        );
      }
    } catch (error) {
      console.error("Error en auto-reasignación:", error);
      // No lanzar error para no bloquear el proceso principal
    }
  }

  /**
   * Obtiene estadísticas de escalaciones
   */
  async getEscalationStats(startDate, endDate) {
    const [stats] = await pool.query(
      `
      SELECT 
        COUNT(*) as total_escalated,
        SUM(CASE WHEN priority_level = 4 THEN 1 ELSE 0 END) as critical_escalated,
        SUM(CASE WHEN priority_level = 3 THEN 1 ELSE 0 END) as high_escalated,
        AVG(TIMESTAMPDIFF(HOUR, created_at, sla_response_deadline)) as avg_response_time_hours,
        AVG(TIMESTAMPDIFF(HOUR, created_at, sla_resolution_deadline)) as avg_resolution_time_hours
      FROM tickets
      WHERE sla_escalated = TRUE
        AND created_at BETWEEN ? AND ?
    `,
      [startDate, endDate]
    );

    return stats[0];
  }
}

module.exports = new SLAEscalationService();
