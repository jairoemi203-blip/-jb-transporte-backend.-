# Backend de reservas - JB Transporte (Bogotá)

API que administra tu horario laboral y las reservas de los clientes.

## Cómo correrlo
npm install
cp .env.example .env
node server.js

## Zonas disponibles
Chapinero, Usaquén, Zona Rosa, Centro, Suba, Aeropuerto El Dorado, Modelia, Kennedy, Embajada EE.UU.

## Tarifas
- Aeropuerto <-> Modelia: $50.000 fijo
- Aeropuerto <-> Usaquén: $90.000 fijo
- Aeropuerto <-> Centro: $80.000 fijo
- Aeropuerto <-> Suba: $90.000 fijo
- Cualquier otro viaje (incluye el aeropuerto con zonas sin tarifa fija): $4.000 base + $3.000/km, mínimo $6.000, recargo 25% en hora pico (6-9am y 5-8pm)

## Endpoints
GET /api/disponibilidad?fecha=2026-08-31&hora=08:00
POST /api/reservas
GET /api/reservas?fecha=2026-08-31
PUT /api/reservas/:id/cancelar
GET /api/horario
PUT /api/horario
