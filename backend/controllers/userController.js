// userController.js
const db = require('../db/db');
const format = require('pg-format');

const list = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Consulta para el total de usuarios
    const totalQuery = `
      SELECT COUNT(*)
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
    `;
    const totalResult = await db.query(totalQuery);

    // Verificación para evitar errores si totalResult no es un array válido
    if (!Array.isArray(totalResult) || totalResult.length === 0) {
      throw new Error("No se pudo obtener el total de usuarios");
    }
    const total = parseInt(totalResult[0].count, 10);

    // Consulta principal para los usuarios
    const query = `
      SELECT
        u.id,
        u.name AS nome,
        u.email,
        r.name AS funcao,
        u.is_active AS ativo
      FROM
        users u
      LEFT JOIN
        roles r ON u.role_id = r.id
      ORDER BY u.name ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const result = await db.query(query);

    // Respuesta con los datos y la paginación
    res.json({
      data: result, // Usamos result directamente como array
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: parseInt(page, 10),
      },
    });
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  const { nome, email, senha, funcao } = req.body;
  try {
    if (!nome || !email || !senha || !funcao) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }
    const checkQuery = format('SELECT id FROM users WHERE email = %L', email);
    const checkResult = await db.query(checkQuery);
    if (checkResult.length > 0) {
      return res.status(409).json({ message: 'E-mail ya está registrado' });
    }
    const query = format('INSERT INTO users (nome, email, senha, funcao) VALUES (%L, %L, %L, %L) RETURNING id', nome, email, senha, funcao);
    const result = await db.query(query);
    res.status(201).json({ id: result[0].id, message: 'Usuario creado con éxito' });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, funcao, ativo } = req.body;
  try {
    const checkQuery = format('SELECT id FROM users WHERE id = %L', id);
    const checkResult = await db.query(checkQuery);
    if (checkResult.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const updateFields = [];
    if (nome) updateFields.push(format('name = %L', nome)); // Usamos 'name' en lugar de 'nome'
    if (email) updateFields.push(format('email = %L', email));
    if (senha) updateFields.push(format('password = %L', senha)); // Usamos 'password' en lugar de 'senha'
    if (ativo !== undefined) updateFields.push(format('is_active = %L', ativo)); // Usamos 'is_active' en lugar de 'ativo'

    if (funcao) {
      // Obtener el role_id basado en el nombre del rol (funcao)
      const roleQuery = format('SELECT id FROM roles WHERE name = %L', funcao);
      const roleResult = await db.query(roleQuery);
      if (roleResult.length === 0) {
        return res.status(400).json({ message: 'Rol no encontrado' });
      }
      const roleId = roleResult[0].id;
      updateFields.push(format('role_id = %L', roleId)); // Usamos 'role_id' en lugar de 'funcao'
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron datos para actualizar' });
    }

    const query = format('UPDATE users SET %s WHERE id = %L', updateFields.join(', '), id);
    await db.query(query);
    res.json({ message: 'Usuario actualizado con éxito' });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const del = async (req, res) => {
  const { id } = req.params;
  try {
    const query = format('DELETE FROM users WHERE id = %L RETURNING id, name, email, funcao, ativo', id);
    const result = await db.query(query);
    res.json({ data: result.rows[0], message: 'Usuario eliminado con éxito' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  list,
  create,
  update,
  del,
};