const express = require('express');
const router = express.Router();
const { load, save } = require('../db');
const { requireAdminKey } = require('../middleware');

router.get('/horario', requireAdminKey, (req, res) => {
  const data = load();
  res.json(data.horario);
});

router.put('/horario', requireAdminKey, (req, res) => {
  const { dia, inicio, fin, libre } = req.body;
  if (dia === undefined || dia < 0 || dia > 6) {
    return res.status(400).json({ error: 'El campo dia debe ser 0-6 (0=domingo).' });
  }
  const data = load();
  if (libre) {
    data.horario[dia] = null;
  } else {
    if (!inicio || !fin) {
      return res.status(400).json({ error: 'Faltan inicio y fin.' });
    }
    data.horario[dia] = { inicio, fin };
  }
  save(data);
  res.json(data.horario);
});

module.exports = router;
