import http from "k6/http";
import { check, sleep } from "k6";

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:3000";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJjbXBuNGVtYncwMDA4czhwc2JvazF0a21hIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgxMDI3MDc4LCJleHAiOjE3ODE2MzE4Nzh9.lsWAiN8D8ibt1IKIIkcxUJLGwL-ZrGdeRWQNUBaep70";
const PRODUCT_ID = "cmpn8ov0p0009s86c8t8qoam7";

const PARAMS = {
  headers: {
    "Content-Type": "application/json",
    Cookie: `token=${TOKEN}`,
  },
};

// ─── ESCENARIO DE ESTRÉS ───────────────────────────────────────────────────────
// Sube la carga gradualmente de 5 a 30 usuarios virtuales.
// Cada etapa dura 30 segundos para estabilizarse antes de subir más.
// Objetivo: encontrar el punto donde el sistema empieza a degradarse.
//
// Etapas:
//   0s  →  5 VUs   (carga normal de cafetería)
//   30s →  10 VUs  (el doble)
//   60s →  20 VUs  (carga alta)
//   90s →  30 VUs  (estrés máximo)
//   120s → 0 VUs   (bajada)
export const options = {
  stages: [
    { duration: "30s", target: 5  },
    { duration: "30s", target: 10 },
    { duration: "30s", target: 20 },
    { duration: "30s", target: 30 },
    { duration: "15s", target: 0  },
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"], // umbral más amplio para estrés
    "http_req_failed": ["rate<0.05"],  // menos del 5% de errores
  },
};

// setup() obtiene los estudiantes una sola vez
export function setup() {
  const res = http.get(`${BASE_URL}/api/students`, {
    headers: { Cookie: `token=${TOKEN}` },
  });

  const data = JSON.parse(res.body);
  const students = data.students ?? data;
  const activeIds = students.filter((s) => s.isActive).map((s) => s.id);

  console.log(`✓ ${activeIds.length} estudiantes activos cargados`);
  return { studentIds: activeIds };
}

export default function (data) {
  const { studentIds } = data;

  if (studentIds.length === 0) return;

  // Distribuye los VUs entre los estudiantes disponibles
  const index = (__VU - 1) % studentIds.length;
  const studentId = studentIds[index];

  const payload = JSON.stringify({
    studentId,
    items: [{ productId: PRODUCT_ID, quantity: 1 }],
  });

  const res = http.post(`${BASE_URL}/api/sales`, payload, PARAMS);

  check(res, {
    "sin error interno": (r) => r.status !== 500,
    "respuesta válida": (r) => r.status === 201 || r.status === 400,
  });

  sleep(1);
}
