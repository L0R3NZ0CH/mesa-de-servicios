const { body, validationResult } = require('express-validator');

// Middleware para validar resultados
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones comunes
const validations = {
  login: [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  createTicket: [
    body('title').notEmpty().withMessage('El título es requerido'),
    body('description').notEmpty().withMessage('La descripción es requerida'),
    body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Prioridad inválida'),
    body('category_id').isInt().withMessage('Categoría inválida')
  ],
  createUser: [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').isIn(['admin', 'technician', 'user']).withMessage('Rol inválido')
  ]
};

module.exports = {
  validate,
  validations
};

