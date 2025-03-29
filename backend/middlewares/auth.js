// middlewares/auth.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Si el método es POST y la ruta es /api/auth/login, saltear el middleware
  if (req.path === "/auth/login") {
    return next();
  }

  // Obtener el token del header 'Authorization'
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Acceso denegado. No se proporcionó token." });
  }

  // El token debe estar en el formato "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Acceso denegado. Formato de token inválido." });
  }

  try {
    // Verificar el token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Agregar la información decodificada del usuario a la solicitud
    next(); // Continuar con la siguiente función en la cadena
  } catch (err) {
    res.status(400).json({ message: "Token inválido." });
  }
};

module.exports = authMiddleware;
