const { load } = require('./db');

const DURACION_VIAJE_MIN = 45;

function aMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function seSuperponen(inicioA, finA, inicioB, finB) {
  return inicioA < finB && inicioB < finA;
}

function diaDeSemana(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

function chequearDisponibilidad(fecha, hora) {
  const data = load();
  const dia = diaDeSemana(fecha);
  const horario = data.horario[dia];

  if (!horario) {
    return { disponible: false, motivo: 'dia_no_laboral' };
  }

  const inicioSolicitud = aMinutos(hora);
  const finSolicitud = inicioSolicitud + DURACION_VIAJE_MIN;
  const inicioJornada = aMinutos(horario.inicio);
  const finJornada = aMinutos(horario.fin);

  if (inicioSolicitud < inicioJornada || finSolicitud > finJornada) {
    return { disponible: false, motivo: 'fuera_de_horario', horario };
  }

  const reservasDelDia = data.reservas.filter(
    (r) => r.fecha === fecha && r.estado !== 'cancelada'
  );

  const chocaConOtra = reservasDelDia.some((r) => {
    const inicioR = aMinutos(r.hora);
    const finR = inicioR + DURACION_VIAJE_MIN;
    return seSuperponen(inicioSolicitud, finSolicitud, inicioR, finR);
  });

  if (chocaConOtra) {
    return { disponible: false, motivo: 'horario_ocupado' };
  }

  return { disponible: true };
}

module.exports = { chequearDisponibilidad, DURACION_VIAJE_MIN };
