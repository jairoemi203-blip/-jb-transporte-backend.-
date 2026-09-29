const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_CONDUCTOR,
  WEBHOOK_WHATSAPP_URL
} = process.env;

let transporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

async function notificarNuevaReserva(reserva) {
  const texto =
    `Nueva reserva\n` +
    `Fecha: ${reserva.fecha} ${reserva.hora}\n` +
    `Origen: ${reserva.origen}\n` +
    `Destino: ${reserva.destino}\n` +
    `Precio: $${reserva.precio.toLocaleString('es-CO')}\n` +
    `Pago: ${reserva.medioPago}\n` +
    `Cliente: ${reserva.clienteNombre} · ${reserva.clienteTelefono}`;

  console.log('--- NUEVA RESERVA ---\n' + texto);

  if (transporter && EMAIL_CONDUCTOR) {
    try {
      await transporter.sendMail({
        from: SMTP_USER,
        to: EMAIL_CONDUCTOR,
        subject: `Nueva reserva ${reserva.fecha} ${reserva.hora}`,
        text: texto
      });
    } catch (err) {
      console.error('No se pudo enviar el email de notificación:', err.message);
    }
  }

  if (WEBHOOK_WHATSAPP_URL) {
    try {
      await fetch(WEBHOOK_WHATSAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto })
      });
    } catch (err) {
      console.error('No se pudo enviar la notificación por WhatsApp:', err.message);
    }
  }
}

module.exports = { notificarNuevaReserva };
