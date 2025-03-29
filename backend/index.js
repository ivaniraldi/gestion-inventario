// index.js
const express = require('express');
const path = require('path');
const routes = require('./routes/routes.js');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

// Middleware para permitir solicitudes de origen
app.use(cors());

// Servir archivos estáticos desde la carpeta raíz del proyecto
app.use(express.static(path.join(__dirname)));

// Ruta para la página principal de documentación
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Montar todas las rutas bajo el prefijo '/api'
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`💚 Servidor ejecutándose en http://localhost:${PORT} --- 🚀`);
  console.log(`📚 Documentación disponible en http://localhost:${PORT}`);
});