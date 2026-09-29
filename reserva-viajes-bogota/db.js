const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function defaultData() {
  return {
    horario: {
      0: null,
      1: { inicio: '06:00', fin: '21:00' },
      2: { inicio: '06:00', fin: '21:00' },
      3: { inicio: '06:00', fin: '21:00' },
      4: { inicio: '06:00', fin: '21:00' },
      5: { inicio: '06:00', fin: '21:00' },
      6: { inicio: '07:00', fin: '15:00' }
    },
    reservas: []
  };
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    save(defaultData());
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function save(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
