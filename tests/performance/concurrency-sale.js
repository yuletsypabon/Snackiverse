import http from "k6/http";
import { check, sleep } from "k6";

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:3000";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJjbXBuNGVtYncwMDA4czhwc2JvazF0a21hIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgxMDI3MDc4LCJleHAiOjE3ODE2MzE4Nzh9.lsWAiN8D8ibt1IKIIkcxUJLGwL-ZrGdeRWQNUBaep70";
const STUDENT_ID = "cmq73ow7s0000s874pa8hc1r3";
const PRODUCT_ID = "cmpn8ov0p0009s86c8t8qoam7";

// ─── ESCENARIO ─────────────────────────────────────────────────────────────────
// 5 usuarios virtuales lanzan ventas simultáneas durante 15 segundos.
// Cada venta descuenta saldo al mismo estudiante prepago.
// Objetivo: verificar que las transacciones Prisma son seguras bajo concurrencia.
export const options = {
  vus: 5,        // usuarios virtuales simultáneos
  duration: "15s",
  thresholds: {
    http_req_duration: ["p(95)<1000"], // el 95% de requests debe responder en menos de 1s
  },
};

// ─── SCRIPT PRINCIPAL ──────────────────────────────────────────────────────────
export default function () {
  const payload = JSON.stringify({
    studentId: STUDENT_ID,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 1,
      },
    ],
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${TOKEN}`,
    },
  };

  const res = http.post(`${BASE_URL}/api/sales`, payload, params);

  check(res, {
    "status 201 (venta creada) o 400 (saldo insuficiente)": (r) =>
      r.status === 201 || r.status === 400,
    "no hubo error interno del servidor": (r) => r.status !== 500,
  });

  sleep(0.5);
}
