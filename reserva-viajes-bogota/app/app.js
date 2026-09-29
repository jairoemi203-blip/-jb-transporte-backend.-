// Cambiá esto por la URL donde publiques el backend (ver README).
const API_URL = window.API_URL || 'http://localhost:3000';

const ZONAS = ['Chapinero', 'Usaquén', 'Zona Rosa', 'Centro', 'Suba', 'Aeropuerto El Dorado', 'Modelia', 'Kennedy', 'Embajada EE.UU.'];

const DIST = {
  'Chapinero-Usaquén': 6, 'Chapinero-Zona Rosa': 3, 'Chapinero-Centro': 8, 'Chapinero-Suba': 10, 'Chapinero-Aeropuerto El Dorado': 16,
  'Usaquén-Zona Rosa': 7, 'Usaquén-Centro': 13, 'Usaquén-Suba': 9, 'Usaquén-Aeropuerto El Dorado': 22,
  'Zona Rosa-Centro': 9, 'Zona Rosa-Suba': 12, 'Zona Rosa-Aeropuerto El Dorado': 18,
  'Centro-Suba': 15, 'Centro-Aeropuerto El Dorado': 21,
  'Suba-Aeropuerto El Dorado': 24,
  'Modelia-Chapinero': 9, 'Modelia-Usaquén': 15, 'Modelia-Zona Rosa': 10, 'Modelia-Centro': 11, 'Modelia-Suba': 8, 'Modelia-Aeropuerto El Dorado': 4,
  'Kennedy-Chapinero': 14, 'Kennedy-Usaquén': 22, 'Kennedy-Zona Rosa': 15, 'Kennedy-Centro': 11, 'Kennedy-Suba': 16, 'Kennedy-Aeropuerto El Dorado': 8,
  'Embajada EE.UU.-Chapinero': 5, 'Embajada EE.UU.-Usaquén': 12, 'Embajada EE.UU.-Zona Rosa': 6, 'Embajada EE.UU.-Centro': 4, 'Embajada EE.UU.-Suba': 13, 'Embajada EE.UU.-Aeropuerto El Dorado': 10,
  'Modelia-Kennedy': 6, 'Modelia-Embajada EE.UU.': 9, 'Kennedy-Embajada EE.UU.': 10
};

// Tarifas fijas desde/hacia el aeropuerto para ciertas zonas.
// Las zonas que no están acá se calculan por km como cualquier otro viaje.
const TARIFA_AEROPUERTO = {
  'Modelia': 50000,
  'Usaquén': 90000,
  'Centro': 80000,
  'Suba': 90000
};

function getDist(a, b) {
  if (a === b) return 2;
  return DIST[`${a}-${b}`] || DIST[`${b}-${a}`] || 10;
}

function calcPrecio(origen, destino, hora) {
  const AEROPUERTO = 'Aeropuerto El Dorado';
  if (origen === AEROPUERTO || destino === AEROPUERTO) {
    const otraZona = origen === AEROPUERTO ? destino : origen;
    if (TARIFA_AEROPUERTO[otraZona] !== undefined) {
      return TARIFA_AEROPUERTO[otraZona];
    }
  }
  const km = getDist(origen, destino);
  const base = 4000, porKm = 3000, minimo = 6000;
  const h = parseInt(hora.split(':')[0], 10);
  const pico = ((h >= 6 && h <= 9) || (h >= 17 && h <= 20)) ? 1.25 : 1;
  return Math.max(minimo, Math.round((base + km * porKm) * pico / 500) * 500);
}

const $ = (id) => document.getElementById(id);
const origenEl = $('origen'), destinoEl = $('destino'), fechaEl = $('fecha'), horaEl = $('hora');
const dispEl = $('disp'), precioEl = $('precio'), errorEl = $('error');
const nombreEl = $('nombre'), telefonoEl = $('telefono'), confirmarBtn = $('confirmar');
const confirmacionEl = $('confirmacion');
let pagoSel = null, disponible = false;

ZONAS.forEach((z) => {
  origenEl.add(new Option(z, z));
  destinoEl.add(new Option(z, z));
});
destinoEl.value = 'Aeropuerto El Dorado';

const hoy = new Date().toISOString().split('T')[0];
fechaEl.value = hoy;
fechaEl.min = hoy;

function mostrarError(msg) {
  errorEl.textContent = msg;
  errorEl.style.display = msg ? 'block' : 'none';
}

async function chequearDisponibilidad() {
  dispEl.className = 'neutro';
  dispEl.textContent = 'Consultando disponibilidad...';
  disponible = false;
  try {
    const r = await fetch(`${API_URL}/api/disponibilidad?fecha=${fechaEl.value}&hora=${horaEl.value}`);
    const data = await r.json();
    if (data.disponible) {
      dispEl.className = 'libre';
      dispEl.textContent = '✓ Disponible';
      disponible = true;
    } else {
      dispEl.className = 'ocupado';
      const motivos = {
        dia_no_laboral: 'Ese día no se trabaja',
        fuera_de_horario: 'Fuera del horario de servicio',
        horario_ocupado: 'Ese horario ya está reservado'
      };
      dispEl.textContent = '✕ ' + (motivos[data.motivo] || 'No disponible');
    }
  } catch (e) {
    dispEl.className = 'ocupado';
    dispEl.textContent = 'No se pudo conectar con el servidor';
  }
}

function actualizarPrecio() {
  const p = calcPrecio(origenEl.value, destinoEl.value, horaEl.value);
  precioEl.textContent = '$' + p.toLocaleString('es-CO');
  return p;
}

[fechaEl, horaEl].forEach((el) => el.addEventListener('change', () => { chequearDisponibilidad(); actualizarPrecio(); }));
[origenEl, destinoEl].forEach((el) => el.addEventListener('change', actualizarPrecio));

document.querySelectorAll('.pago-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pago-btn').forEach((b) => b.classList.remove('activo'));
    btn.classList.add('activo');
    pagoSel = btn.dataset.pago;
  });
});

confirmarBtn.addEventListener('click', async () => {
  mostrarError('');
  if (!disponible) return mostrarError('Ese horario no está disponible.');
  if (origenEl.value === destinoEl.value) return mostrarError('El origen y el destino no pueden ser iguales.');
  if (!nombreEl.value.trim() || !telefonoEl.value.trim()) return mostrarError('Completá tu nombre y celular.');
  if (!pagoSel) return mostrarError('Elegí un medio de pago.');

  confirmarBtn.disabled = true;
  confirmarBtn.textContent = 'Reservando...';

  try {
    const r = await fetch(`${API_URL}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fecha: fechaEl.value,
        hora: horaEl.value,
        origen: origenEl.value,
        destino: destinoEl.value,
        precio: actualizarPrecio(),
        medioPago: pagoSel,
        clienteNombre: nombreEl.value.trim(),
        clienteTelefono: telefonoEl.value.trim()
      })
    });
    const data = await r.json();
    if (!r.ok) {
      mostrarError(data.error || 'No se pudo completar la reserva.');
      chequearDisponibilidad();
      return;
    }
    confirmacionEl.style.display = 'block';
    confirmacionEl.textContent = `✓ Reserva confirmada: ${data.origen} → ${data.destino}, ${data.fecha} ${data.hora}, ${data.medioPago}, $${data.precio.toLocaleString('es-CO')}`;
  } catch (e) {
    mostrarError('No se pudo conectar con el servidor.');
  } finally {
    confirmarBtn.disabled = false;
    confirmarBtn.textContent = 'Confirmar reserva';
  }
});

chequearDisponibilidad();
actualizarPrecio();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js').catch(() => {}));
}
