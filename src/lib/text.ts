// Normaliza texto para búsquedas: minúsculas y sin tildes/acentos.
// Así "José" encuentra "jose" y "plátano" encuentra "platano".
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
