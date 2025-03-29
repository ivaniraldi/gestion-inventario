// Importar el constructor Pool del paquete pg
const { Pool } = require('pg');
require('dotenv').config();
// Configurar el pool de conexiones con los datos de tu base de datos
const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
});

// Función para verificar la conexión
const checkConnection = async () => {
  try {
    // Intentar obtener una conexión del pool
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a la base de datos');
    // Liberar la conexión de vuelta al pool
    client.release();
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  }
};

// Función para ejecutar consultas SQL
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res.rows; // Devuelve las filas resultantes de la consulta
  } catch (err) {
    console.error('Error ejecutando la consulta:', err.stack);
    throw err; // Lanza el error para que el llamador lo maneje
  }
};

// Exportar las funciones
module.exports = {
  query,
  checkConnection,
};

// Verificar la conexión al iniciar
checkConnection();