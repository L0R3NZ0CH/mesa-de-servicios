const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

require("dotenv").config();

const { testConnection } = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");
const schedulerService = require("./services/schedulerService");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas de la API
app.use("/api", routes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API de Mesa de Servicios",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      tickets: "/api/tickets",
      technicians: "/api/technicians",
      knowledgeBase: "/api/knowledge-base",
      feedback: "/api/feedback",
      reports: "/api/reports",
      sla: "/api/sla",
      notifications: "/api/notifications",
      categories: "/api/categories",
      users: "/api/users",
    },
  });
});

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error(
        "⚠️  No se pudo conectar a la base de datos. Verifica la configuración."
      );
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(
        `📚 Documentación de endpoints disponible en http://localhost:${PORT}`
      );
      console.log(`💾 Base de datos conectada`);

      // Iniciar trabajos programados (escalación automática)
      schedulerService.start();
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on("SIGTERM", () => {
  console.log("SIGTERM recibido, cerrando servidor...");
  schedulerService.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT recibido, cerrando servidor...");
  schedulerService.stop();
  process.exit(0);
});

startServer();

module.exports = app;
