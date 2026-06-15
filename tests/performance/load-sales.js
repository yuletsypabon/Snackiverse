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

// ─── ESCENARIO ─────────────────────────────────────────────────────────────────
// 7 usuarios virtuales (= 7 vendedores) registran ventas durante 30 segundos.
// Cada VU elige un estudiante distinto del pool para simular la cafetería real.
// Objetivo: verificar que los tiempos de respuesta son aceptables bajo carga real.
export const options = {
  vus: 7,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% de ventas deben responder en menos de 2s
    checks: ["rate>0.95"],             // al menos 95% de checks deben pasar
  },
};

// setup() corre UNA sola vez antes de la prueba y obtiene los IDs de estudiantes
export function setup() {
  const res = http.get(`${BASE_URL}/api/students`, {
    headers: { Cookie: `token=${TOKEN}` },
  });

  if (res.status !== 200) {
    console.error(`No se pudieron obtener estudiantes: ${res.status} ${res.body}`);
    return { studentIds: [] };
  }

  const data = JSON.parse(res.body);
  const students = data.students ?? data;
  const activeIds = students
    .filter((s) => s.isActive)
    .map((s) => s.id);

  console.log(`✓ ${activeIds.length} estudiantes activos cargados`);
  return { studentIds: activeIds };
}

// Función principal — se ejecuta en loop por cada VU
export default function (data) {
  const { studentIds } = data;

  if (studentIds.length === 0) {
    console.error("Sin estudiantes disponibles, abortando iteración.");
    return;
  }

  // Cada VU elige un estudiante distinto según su índice
  // __VU va de 1 a 7, así que cada vendedor siempre atiende estudiantes diferentes
  const index = (__VU - 1 + Math.floor(Math.random() * 5)) % studentIds.length;
  const studentId = studentIds[index];

  const payload = JSON.stringify({
    studentId,
    items: [{ productId: PRODUCT_ID, quantity: 1 }],
  });

  const res = http.post(`${BASE_URL}/api/sales`, payload, PARAMS);

  check(res, {
    "venta procesada (201 o 400)": (r) => r.status === 201 || r.status === 400,
    "sin error interno": (r) => r.status !== 500,
    "responde en menos de 2s": (r) => r.timings.duration < 2000,
  });

  sleep(1); // pausa entre ventas (simula tiempo real del vendedor)
}
