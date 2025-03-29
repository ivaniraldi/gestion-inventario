// cashClosingController.js
const db = require('../db/db');
const format = require('pg-format');

const create = async (req, res) => {
  const { data, observacoes } = req.body;
  const user_id = req.user.id; // Asumiendo middleware de autenticación
  console.log("Data:", data);
  console.log("Observações:", observacoes);
  console.log("User ID:", user_id);
  try {
    if (!data) {
      return res.status(400).json({ message: 'Fecha requerida' });
    }

    // Consulta de resumen con optimización
    const summaryQuery = `
      SELECT 
        COUNT(*) AS totalMovimentos,
        SUM(CASE WHEN type = 'entrada' THEN 1 ELSE 0 END) AS entradas,
        SUM(CASE WHEN type = 'saída' THEN 1 ELSE 0 END) AS saidas,
        SUM(CASE WHEN type = 'entrada' THEN quantity * p.price ELSE -quantity * p.price END) AS valorTotal
      FROM movements m
      JOIN products p ON m.product_id = p.id
      WHERE DATE(m.movement_date) = $1
    `;
    const summaryResult = await db.query(summaryQuery, [data]);
    console.log("Summary result:", summaryResult);
    const summary = summaryResult[0];

    if (!summary) {
      return res.status(404).json({ message: 'No se encontraron movimientos para esa fecha' });
    }

    // Insertar cierre de caja
    const insertQuery = `
      INSERT INTO cash_closures (closure_date, notes, user_id, total_movements, entries, exits, total_value)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;
    const result = await db.query(insertQuery, [
      data, 
      observacoes || '', 
      user_id, 
      summary.totalmovimentos, 
      summary.entradas, 
      summary.saidas, 
      summary.valortotal
    ]);
    console.log("Result:", result);

    res.status(201).json({
      id: result[0].id,
      resumo: {
        totalMovimentos: summary.totalMovimentos,
        entradas: summary.entradas,
        saidas: summary.saidas,
        valorTotal: summary.valorTotal
      },
      message: 'Fechamento realizado com sucesso'
    });

  } catch (err) {
    console.error('Error al crear cierre de caja:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


/* const list = async (req, res) => {
  const { startDate, endDate, page = 1, limit = 10 } = req.query;
  try {
    // Construcción de la consulta con parámetros de fecha y paginación
    let query = `
      SELECT id, closure_date AS data, total_movements AS totalMovimentos, 
             total_value AS valorTotal, user_id AS usuario
      FROM cash_closures
    `;
    const conditions = [];
    const values = [];

    // Agregar filtros de fecha si están presentes
    if (startDate) {
      conditions.push('closure_date >= $' + (values.length + 1));
      values.push(startDate);
    }
    if (endDate) {
      conditions.push('closure_date <= $' + (values.length + 1));
      values.push(endDate);
    }

    // Aplicar los filtros de fecha en la consulta
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Ordenar los resultados por fecha descendente
    query += ' ORDER BY closure_date DESC';
    
    // Paginación
    query += ' LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    values.push(limit, (page - 1) * limit);

    const result = await db.query(query, values);

    // Obtener el total de registros
    const countQuery = 'SELECT COUNT(*) FROM cash_closures' + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '');
    const totalResult = await db.query(countQuery, values);
    const total = parseInt(totalResult.rows[0].count, 10);

    // Formatear los resultados para la respuesta
    const responseData = result.rows.map(item => ({
      id: item.id,
      data: item.data.toISOString(), // Formatear fecha a formato ISO
      totalMovimentos: item.totalmovimentos,
      valorTotal: parseFloat(item.valortotal), // Asegurar que el valor es un número decimal
      usuario: item.usuario
    }));

    // Enviar la respuesta con datos y paginación
    res.status(200).json({
      data: responseData,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: parseInt(page, 10),
      },
    });

  } catch (err) {
    console.error('Error al listar cierres de caja:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; */
const list = async (req, res) => {
  try {
    const response = await db.query('SELECT * FROM cash_closures');
    res.json(response);
  } catch (error) {
    console.error('Error al listar cierres de caja:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

const del = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await db.query('DELETE FROM cash_closures WHERE id = $1', [id]);
    res.json(response);
  } catch (error) {
    console.error('Error al eliminar cierre de caja:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = {
  create,
  list,
  del
};
