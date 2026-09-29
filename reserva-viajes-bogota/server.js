const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', require('./routes/reservas'));
app.use('/api', require('./routes/horario'));

app.get('/', (req, res) => {
  res.json({ ok: true, servicio: 'JB Transporte - Bogotá' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
