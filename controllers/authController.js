const User = require('../models/User');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const Notification = require('../models/Notification');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuario
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await User.comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si el usuario está activo
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Usuario inactivo'
        });
      }

      // Generar token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      // Obtener información del usuario sin contraseña
      const userInfo = await User.findById(user.id);

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          token,
          user: userInfo
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en el login',
        error: error.message
      });
    }
  }

  async register(req, res) {
    try {
      const { email, password, first_name, last_name, role, phone, department } = req.body;

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Crear usuario
      const userId = await User.create({
        email,
        password,
        first_name,
        last_name,
        role: role || 'user',
        phone,
        department
      });

      const user = await User.findById(userId);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
        error: error.message
      });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { first_name, last_name, phone, department } = req.body;
      const user = await User.update(req.user.id, {
        first_name,
        last_name,
        phone,
        department
      });

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Obtener usuario con contraseña
      const user = await User.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isValidPassword = await User.comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Actualizar contraseña
      await User.update(req.user.id, { password: newPassword });

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al cambiar contraseña',
        error: error.message
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        // Por seguridad, no revelamos si el email existe o no
        return res.json({
          success: true,
          message: 'Si el email existe, se enviará un enlace de recuperación'
        });
      }

      // TODO: Implementar envío de email con token de recuperación
      // Por ahora solo retornamos éxito

      res.json({
        success: true,
        message: 'Si el email existe, se enviará un enlace de recuperación'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al procesar solicitud',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();

