// settingsController.js
const db = require('../db/db');
const format = require('pg-format');

const get = async (req, res) => {
  try {
    const query = 'SELECT * FROM settings LIMIT 1';
    const result = await db.query(query);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    const { empresa_nome, empresa_email, empresa_telefone, empresa_endereco, notificacao_alerta_estoque, notificacao_relatorios_diarios, notificacao_email } = result[0];
    res.json({
      empresa: {
        nome: empresa_nome,
        email: empresa_email,
        telefone: empresa_telefone,
        endereco: empresa_endereco
      },
      notificacoes: {
        alertaEstoque: notificacao_alerta_estoque,
        relatoriosDiarios: notificacao_relatorios_diarios,
        emailNotificaciones: notificacao_email
      }
    });
  } catch (err) {
    console.error('Error al obtener configuración:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  const { empresa, notificacoes } = req.body;
  try {
    const updateFields = [];
    if (empresa) {
      if (empresa.nome) updateFields.push(format('empresa_nome = %L', empresa.nome));
      if (empresa.email) updateFields.push(format('empresa_email = %L', empresa.email));
      if (empresa.telefone) updateFields.push(format('empresa_telefone = %L', empresa.telefone));
      if (empresa.endereco) updateFields.push(format('empresa_endereco = %L', empresa.endereco));
    }
    if (notificacoes) {
      if (notificacoes.alertaEstoque !== undefined) updateFields.push(format('notificacao_alerta_estoque = %L', notificacoes.alertaEstoque));
      if (notificacoes.relatoriosDiarios !== undefined) updateFields.push(format('notificacao_relatorios_diarios = %L', notificacoes.relatoriosDiarios));
      if (notificacoes.emailNotificacoes !== undefined) updateFields.push(format('notificacao_email = %L', notificacoes.emailNotificacoes));
    }
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron datos para actualizar' });
    }
    const query = format('UPDATE settings SET %s', updateFields.join(', '));
    await db.query(query);
    res.json({ message: 'Configuración actualizada con éxito' });
  } catch (err) {
    console.error('Error al actualizar configuración:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  get,
  update
};