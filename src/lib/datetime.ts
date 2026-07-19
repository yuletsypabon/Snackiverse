// Utilidades de fecha/hora ancladas a Colombia (America/Bogota, UTC-5 fijo, sin horario de verano).
// Motivo: la BD guarda createdAt en UTC. Formatear sin timeZone muestra la hora del entorno
// (Azure corre en UTC) => +5h. Y agrupar "hoy" con setHours usa medianoche del servidor, no de Colombia.

export const COLOMBIA_TZ = "America/Bogota";

/** Formatea una fecha/hora (ISO string o Date) en hora Colombia. */
export function formatColombia(value: string | Date, options: Intl.DateTimeFormatOptions): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-CO", { timeZone: COLOMBIA_TZ, ...options }).format(d);
}

/** Fecha corta en hora Colombia, ej. "15 jul". */
export function formatColombiaDate(value: string | Date): string {
  return formatColombia(value, { day: "numeric", month: "short" });
}

/** Hora en formato Colombia, ej. "09:41 p. m.". */
export function formatColombiaTime(value: string | Date): string {
  return formatColombia(value, { hour: "2-digit", minute: "2-digit" });
}

/**
 * Instante UTC correspondiente a la medianoche de HOY en Colombia (00:00 -05:00).
 * Sirve para filtrar/agrupar "hoy" en el servidor sin depender de su zona horaria.
 */
export function startOfTodayColombia(): Date {
  const OFFSET_MS = 5 * 60 * 60 * 1000; // Colombia = UTC-5 fijo
  const col = new Date(Date.now() - OFFSET_MS); // "ahora" en hora de pared de Colombia (leido como UTC)
  const y = col.getUTCFullYear();
  const m = col.getUTCMonth();
  const d = col.getUTCDate();
  // Medianoche Colombia (00:00 -05:00) = 05:00 UTC de esa misma fecha.
  return new Date(Date.UTC(y, m, d, 5, 0, 0, 0));
}
