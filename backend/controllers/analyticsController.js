const db = require('../db/db');
const format = require('pg-format');

const summary = async (req, res) => {
  const { period } = req.query;
  try {
    const validPeriods = ['day', 'week', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ message: 'Período inválido' });
    }
    const dateCondition = {
      day: 'CURRENT_DATE',
      week: 'CURRENT_DATE - INTERVAL \'1 week\'',
      month: 'CURRENT_DATE - INTERVAL \'1 month\'',
      year: 'CURRENT_DATE - INTERVAL \'1 year\''
    }[period];
    const query = format(`
      SELECT 
        COUNT(DISTINCT p.id) AS total_produtos,
        SUM(p.price * p.stock) AS valor_total,
        SUM(CASE WHEN m.type = 'entrada' THEN m.quantity ELSE 0 END) AS entradas,
        SUM(CASE WHEN m.type = 'saída' THEN m.quantity ELSE 0 END) AS saidas,
        COUNT(CASE WHEN p.stock <= p.alert_threshold THEN 1 END) AS alertas
      FROM products p
      LEFT JOIN movements m ON p.id = m.product_id AND m.movement_date >= %s
    `, dateCondition);
    const result = await db.query(query);
    res.json({
      totalProdutos: result[0].total_produtos,
      valorTotal: result[0].valor_total,
      movimentos: {
        entradas: result[0].entradas,
        saidas: result[0].saidas
      },
      alertas: result[0].alertas
    });
  } catch (err) {
    console.error('Error en summary analytics:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const movements = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate y endDate son requeridos' });
    }
    const query = format(`
      SELECT 
        DATE(m.movement_date) AS date,
        SUM(CASE WHEN m.type = 'entrada' THEN m.quantity ELSE 0 END) AS entradas,
        SUM(CASE WHEN m.type = 'saída' THEN m.quantity ELSE 0 END) AS saidas,
        SUM(CASE WHEN m.type = 'entrada' THEN m.quantity * p.price ELSE -m.quantity * p.price END) AS valor
      FROM movements m
      JOIN products p ON m.product_id = p.id
      WHERE m.movement_date BETWEEN %L AND %L
      GROUP BY DATE(m.movement_date)
      ORDER BY date ASC
    `, startDate, endDate);
    const result = await db.query(query);
    const totalsQuery = format(`
      SELECT 
        SUM(CASE WHEN m.type = 'entrada' THEN m.quantity ELSE 0 END) AS entradas,
        SUM(CASE WHEN m.type = 'saída' THEN m.quantity ELSE 0 END) AS saidas,
        SUM(CASE WHEN m.type = 'entrada' THEN m.quantity * p.price ELSE -m.quantity * p.price END) AS valor
      FROM movements m
      JOIN products p ON m.product_id = p.id
      WHERE m.movement_date BETWEEN %L AND %L
    `, startDate, endDate);
    const totalsResult = await db.query(totalsQuery);
    res.json({
      daily: result,
      totals: totalsResult[0]
    });
  } catch (err) {
    console.error('Error en movements analytics:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  summary,
  movements
};