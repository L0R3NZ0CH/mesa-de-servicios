const cron = require("node-cron");
const slaEscalationService = require("./slaEscalationService");

class SchedulerService {
  constructor() {
    this.jobs = [];
  }

  /**
   * Inicia todos los trabajos programados
   */
  start() {
    console.log("🕐 Iniciando trabajos programados...");

    // Verificar escalación de SLA cada 5 minutos
    const slaCheckJob = cron.schedule("*/5 * * * *", async () => {
      try {
        console.log("🔄 Ejecutando verificación de SLA...");
        await slaEscalationService.checkAndEscalateTickets();
      } catch (error) {
        console.error("Error en verificación de SLA:", error);
      }
    });

    this.jobs.push({ name: "SLA Check", job: slaCheckJob });

    // Reporte diario de escalaciones (todos los días a las 8:00 AM)
    const dailyReportJob = cron.schedule("0 8 * * *", async () => {
      try {
        console.log("📊 Generando reporte diario de escalaciones...");
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await slaEscalationService.getEscalationStats(
          yesterday,
          today
        );

        console.log("📈 Estadísticas de ayer:", stats);
        // Aquí podrías enviar un email o notificación con las estadísticas
      } catch (error) {
        console.error("Error en reporte diario:", error);
      }
    });

    this.jobs.push({ name: "Daily Report", job: dailyReportJob });

    console.log(`✅ ${this.jobs.length} trabajos programados iniciados`);
    this.jobs.forEach((j) => console.log(`   - ${j.name}`));
  }

  /**
   * Detiene todos los trabajos programados
   */
  stop() {
    console.log("🛑 Deteniendo trabajos programados...");
    this.jobs.forEach((j) => {
      j.job.stop();
      console.log(`   - ${j.name} detenido`);
    });
  }

  /**
   * Obtiene el estado de todos los trabajos
   */
  getStatus() {
    return this.jobs.map((j) => ({
      name: j.name,
      running: j.job.running || false,
    }));
  }
}

module.exports = new SchedulerService();
