import http from "k6/http";
import { check } from "k6";

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:3000";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJjbXBuNGVtYncwMDA4czhwc2JvazF0a21hIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgxMDI3MDc4LCJleHAiOjE3ODE2MzE4Nzh9.lsWAiN8D8ibt1IKIIkcxUJLGwL-ZrGdeRWQNUBaep70";

// ─── ESCENARIO ─────────────────────────────────────────────────────────────────
// 1 usuario, llama cada reporte 10 veces seguidas.
// Objetivo: medir cuánto tarda cada endpoint de reporte en responder.
export const options = {
  vus: 1,
  iterations: 10,
  thresholds: {
    "http_req_duration{report:deudores}":    ["p(95)<500"],
    "http_req_duration{report:pendientes}": ["p(95)<500"],
    "http_req_duration{report:paz-y-salvo}": ["p(95)<500"],
    "http_req_duration{report:sales}":      ["p(95)<500"],
  },
};

const params = {
  headers: {
    Cookie: `token=${TOKEN}`,
  },
};

export default function () {
  // deudores
  const r1 = http.get(`${BASE_URL}/api/reports/deudores`, {
    ...params,
    tags: { report: "deudores" },
  });
  check(r1, { "deudores OK": (r) => r.status === 200 });

  // Pendientes
  const r2 = http.get(`${BASE_URL}/api/reports/pendientes`, {
    ...params,
    tags: { report: "pendientes" },
  });
  check(r2, { "pendientes OK": (r) => r.status === 200 });

  // Paz y salvo
  const r3 = http.get(`${BASE_URL}/api/reports/paz-y-salvo`, {
    ...params,
    tags: { report: "paz-y-salvo" },
  });
  check(r3, { "paz-y-salvo OK": (r) => r.status === 200 });

  // Ventas
  const r4 = http.get(`${BASE_URL}/api/reports/sales`, {
    ...params,
    tags: { report: "sales" },
  });
  check(r4, { "sales OK": (r) => r.status === 200 });
}
