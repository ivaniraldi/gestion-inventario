// authController.js
const db = require("../db/db");
const format = require("pg-format");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = format(
      "SELECT * FROM users WHERE email = %L AND password = %L",
      email,
      password
    );
    const result = await db.query(query);
    if (result.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    const user = result[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      //{ expiresIn: "1h" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const logout = (req, res) => {
  // En una API REST, el logout suele manejarse en el cliente (eliminando el token)
  res.json({ message: "Logout realizado con éxito" });
};

module.exports = {
  login,
  logout,
};
