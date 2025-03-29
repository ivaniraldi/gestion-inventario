// movementController.js
const db = require('../db/db');
const format = require('pg-format');

const list = async (req, res) => {
  const { startDate, endDate, type, product, page = 1, limit = 10 } = req.query;
  try {
    let query = 'SELECT m.id, m.movement_date, p.name AS product, m.type, m.quantity, u.name AS user FROM movements m JOIN products p ON m.product_id = p.id JOIN users u ON m.user_id = u.id';
    const conditions = [];
    if (startDate) conditions.push(format('m.movement_date >= %L', startDate));
    if (endDate) conditions.push(format('m.movement_date <= %L', endDate));
    if (type) conditions.push(format('m.type = %L', type));
    if (product) conditions.push(format('p.name ILIKE %L', `%${product}%`));
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY m.movement_date DESC';
    query += format(' LIMIT %L OFFSET %L', limit, (page - 1) * limit);
    const result = await db.query(query);
    const totalResult = await db.query('SELECT COUNT(*) FROM movements m JOIN products p ON m.product_id = p.id JOIN users u ON m.user_id = u.id' + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''));
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
    console.error('Error al listar movimientos:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  const { product_id, type, quantity, notes } = req.body;
  const user_id = req.user.id; // Se asume middleware de autenticación

  try {
      // Iniciar transacción
      await db.query('BEGIN');

      // Obtener el stock actual del producto
      const productQuery = format('SELECT stock FROM products WHERE id = %L FOR UPDATE', product_id);
      const productResult = await db.query(productQuery);

      if (productResult.length === 0) {
          await db.query('ROLLBACK');
          return res.status(404).json({ message: 'Producto no encontrado' });
      }

      let newStock = parseInt(productResult[0].stock, 10);

      // Actualizar stock según el tipo de movimiento
      if (type === 'entrada') {
          let numberStock = Number(newStock) + Number(quantity);
          console.log("Number stock:", numberStock);
          newStock = numberStock;
      } else if (type === 'saída') {
          if (newStock < quantity) {
              await db.query('ROLLBACK');
              return res.status(400).json({ message: 'Stock insuficiente para realizar la salida' });
          }
          newStock -= quantity;
      } else {
          await db.query('ROLLBACK');
          return res.status(400).json({ message: 'Tipo de movimiento inválido' });
      }

      // Actualizar el stock en la base de datos
      const updateStockQuery = format('UPDATE products SET stock = %L WHERE id = %L', newStock, product_id);
      await db.query(updateStockQuery);

      // Registrar el movimiento
      const insertMovementQuery = format(
          'INSERT INTO movements (product_id, type, quantity, notes, user_id) VALUES (%L, %L, %L, %L, %L) RETURNING id',
          product_id, type, quantity, notes, user_id
      );
      const movementResult = await db.query(insertMovementQuery);

      // Confirmar transacción
      await db.query('COMMIT');

      res.status(201).json({ id: movementResult[0].id, message: 'Movimiento registrado con éxito' });
  } catch (err) {
      await db.query('ROLLBACK');
      console.error('Error al registrar movimiento:', err);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
};


module.exports = {
  list,
  create,
};