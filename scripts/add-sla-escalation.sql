-- Agregar columna sla_escalated a la tabla tickets si no existe
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'mesa_servicios' 
                   AND TABLE_NAME = 'tickets' 
                   AND COLUMN_NAME = 'sla_escalated');

SET @query = IF(@col_exists = 0, 
                'ALTER TABLE tickets ADD COLUMN sla_escalated BOOLEAN DEFAULT FALSE',
                'SELECT "Column sla_escalated already exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Crear índices para mejorar el rendimiento de las consultas de escalación
SET @index1_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                      WHERE TABLE_SCHEMA = 'mesa_servicios' 
                      AND TABLE_NAME = 'tickets' 
                      AND INDEX_NAME = 'idx_tickets_sla_escalation');

SET @query1 = IF(@index1_exists = 0, 
                 'CREATE INDEX idx_tickets_sla_escalation ON tickets(status, sla_breached, sla_response_deadline, sla_resolution_deadline)',
                 'SELECT "Index idx_tickets_sla_escalation already exists" AS message');

PREPARE stmt1 FROM @query1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- Actualizar tickets existentes que ya tienen SLA incumplido
UPDATE tickets 
SET sla_escalated = TRUE 
WHERE sla_breached = TRUE 
  AND (sla_escalated IS NULL OR sla_escalated = FALSE);
