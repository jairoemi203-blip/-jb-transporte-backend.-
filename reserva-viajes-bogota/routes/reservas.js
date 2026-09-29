const express = require('express');
const router = express.Router();
const { load, save } = require('../db');
const { chequearDisponibilidad } = require('../disponibilidad');
const { notificarNuevaReserva } = require('../notificaciones');

const ZONAS_VALIDAS = ['Chapinero', 'Usaquén', 'Zona Rosa', 'Centro', 'Suba', 'Aeropuerto El Dorado', 'Modelia', 'Kennedy', 'Embajada EE.UU.'];
const MEDIOS_PAGO_VALIDOS = ['Efectivo', 'Tarjeta', 'Nequi', 'Daviplata'];

router.get('/disponibilidad', (req, res) => {
  const { fecha, hora } = req.query;
  if (!fecha || !hora) {
    return res.status(400).json({ error: 'Faltan los parámetros fecha y hora.' });
  }
  const resultado = chequearDisponibilidad(fecha, hora);
  res.json(resultado);
});

router.get('/reservas', (req, res) => {
  const { fecha } = req.query;
  const data = load();
  const reservas = fecha
    ? data.reservas.filter((r) => r.fecha === fecha)
    : data.reservas;
  res.json(reservas.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora)));
});

router.post('/reservas', async (req, res) => {
  const { fecha, hora, origen, destino, precio, medioPago, clienteNombre, clienteTelefono } = req.body;

  if (!fecha || !hora || !origen || !destino || !precio || !medioPago || !clienteNombre || !clienteTelefono) {
    return res.status(400).json({ error: 'Faltan campos obligatorios en la reserva.' });
  }
  if (!ZONAS_VALIDAS.includes(origen) || !ZONAS_VALIDAS.includes(destino)) {
    return res.status(400).json({ error: 'Origen o destino inválido.' });
  }
  if (origen === destino) {
    return res.status(400).json({ error: 'El origen y el destino no pueden ser iguales.' });
  }
  if (!MEDIOS_PAGO_VALIDOS.includes(medioPago)) {
    return res.status(400).json({ error: 'Medio de pago inválido.' });
  }

  const disponibilidad = chequearDisponibilidad(fecha, hora);
  if (!disponibilidad.disponible) {
    return res.status(409).json({ error: 'Ese horario ya no está disponible.', motivo: disponibilidad.motivo });
  }

  const data = load();
  const nuevaReserva = {
    id: Date.now().toString(36),
    fecha,
    hora,
    origen,
    destino,
    precio: Number(precio),
    medioPago,
    clienteNombre,
    clienteTelefono,
    estado: 'confirmada',
    creadaEn: new Date().toISOString()
  };
  data.reservas.push(nuevaReserva);
  save(data);

  await notificarNuevaReserva(nuevaReserva);

  res.status(201).json(nuevaReserva);
});

router.put('/reservas/:id/cancelar', (req, res) => {
  const data = load();
  const reserva = data.reservas.find((r) => r.id === req.params.id);
  if (!reserva) {
    return res.status(404).json({ error: 'Reserva no encontrada.' });
  }
  reserva.estado = 'cancelada';
  save(data);
  res.json(reserva);
});

module.exports = router;
