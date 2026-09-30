const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_CONDUCTOR,
  WHATSAPP_PHONE,
  WHATSAPP_APIKEY
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

  if (WHATSAPP_PHONE && WHATSAPP_APIKEY) {
    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(WHATSAPP_PHONE)}&text=${encodeURIComponent(texto)}&apikey=${encodeURIComponent(WHATSAPP_APIKEY)}`;
      console.log('--- Llamando a CallMeBot ---');
      const resp = await fetch(url);
      const body = await resp.text();
      console.log('CallMeBot respondió, status:', resp.status);
      console.log('CallMeBot respondió, body:', body);
    } catch (err) {
      console.error('No se pudo enviar la notificación por WhatsApp:', err.message);
    }
  } else {
    console.log('WhatsApp no configurado: falta WHATSAPP_PHONE o WHATSAPP_APIKEY');
  }
}

module.exports = { notificarNuevaReserva };
