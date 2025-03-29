// productController.js
const db = require('../db/db');
const format = require('pg-format');

const list = async (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;
  try {
    let query = 'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id';
    const conditions = [];
    if (search) conditions.push(format('p.name ILIKE %L', `%${search}%`));
    if (category) conditions.push(format('c.name = %L', category));
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY p.name ASC';
    query += format(' LIMIT %L OFFSET %L', limit, (page - 1) * limit);
    const result = await db.query(query);
    const totalQuery = 'SELECT COUNT(*) FROM products p JOIN categories c ON p.category_id = c.id' + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '');
    const totalResult = await db.query(totalQuery);
    const total = parseInt(totalResult[0].count, 10);
    res.json({
      data: result,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: parseInt(page, 10),
      },
    });
  } catch (err) {
    console.error('Error al listar productos:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  const { name, category_id, price, stock, alert_threshold } = req.body;
  try {
    const query = format('INSERT INTO products (name, category_id, price, stock, alert_threshold) VALUES (%L, %L, %L, %L, %L) RETURNING id', name, category_id, price, stock, alert_threshold);
    const result = await db.query(query);
    res.status(201).json({ id: result[0].id, message: 'Producto creado con éxito' });
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, category_id, price, stock, alert_threshold } = req.body;
  try {
    const query = format('UPDATE products SET name = %L, category_id = %L, price = %L, stock = %L, alert_threshold = %L WHERE id = %L', name, category_id, price, stock, alert_threshold, id);
    await db.query(query);
    res.json({ message: 'Producto actualizado con éxito' });
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const del = async (req, res) => {
  const { id } = req.params;
  try {
    const query = format('DELETE FROM products WHERE id = %L', id);
    await db.query(query);
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const listCategories = async (req, res) => {
  try {
    const filtros = req.query;
    if (filtros.name) {
      const query = format('SELECT * FROM categories WHERE name ILIKE %L', `%${filtros.search}%`);
      const result = await db.query(query);
      res.json(result);
      return;
    }else{
      const query = format('SELECT * FROM categories');
      const result = await db.query(query);
      res.json(result);
      return;
    }
  } catch (err) {
    console.error('Error al obtener categorias:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  list,
  create,
  listCategories,
  update,
  delete: del,
};