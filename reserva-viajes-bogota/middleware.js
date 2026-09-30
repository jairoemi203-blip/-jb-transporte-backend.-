function requireAdminKey(req, res, next) {
  const { ADMIN_KEY } = process.env;
  if (!ADMIN_KEY) {
    return res.status(500).json({ error: 'ADMIN_KEY no está configurada en el servidor.' });
  }
  const clave = req.query.clave || req.headers['x-admin-key'];
  if (clave !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Clave incorrecta.' });
  }
  next();
}

module.exports = { requireAdminKey };
