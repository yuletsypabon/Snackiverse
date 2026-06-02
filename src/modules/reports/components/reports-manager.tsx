"use client";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AssessmentIcon from '@mui/icons-material/Assessment';
import { toPng } from "html-to-image";
import { useRef, useState, useMemo, useCallback } from "react";

import { formatCurrency } from "@/lib/currency";
import type { StudentDto } from "@/modules/students/schemas/student.schema";

type SaleItem = { name: string; quantity: number; unitPrice: number; subtotal: number };
type SaleEntry = { id: string; total: number; createdAt: string; items: SaleItem[] };
type RechargeEntry = { id: string; amount: number; note: string | null; createdAt: string };
type ReportData = {
  student: { id: string; name: string; grade: string; type: string; balance: number; guardianWhatsapp: string | null };
  from: string;
  to: string;
  totalConsumed: number;
  totalRecharged: number;
  recharges: RechargeEntry[];
  sales: SaleEntry[];
};

type Props = { students: StudentDto[] };

function toLocalDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}
function toLocalTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
function toInputDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now); mon.setDate(now.getDate() + diff);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { from: toInputDate(mon), to: toInputDate(sun) };
}
function getMonthRange() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: toInputDate(first), to: toInputDate(last) };
}

// ── Comprobante visual ──────────────────────────────────────────────────────
function Comprobante({ data, innerRef }: { data: ReportData; innerRef: React.RefObject<HTMLDivElement | null> }) {
  const isPrepaid = data.student.type === "prepaid";
  const pazYSalvo = isPrepaid ? data.student.balance >= 0 : true;

  return (
    <Box
      ref={innerRef}
      sx={{
        width: 340,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        bgcolor: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header oscuro */}
      <Box sx={{ bgcolor: "#0a2540", px: 2.5, pt: 2, pb: 1.5, textAlign: "center" }}>
        {/* Logo */}
        <Box sx={{ mb: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/sv1.jpeg"
            alt="SnackieVerse"
            style={{ width: 110, height: "auto", borderRadius: 8 }}
            crossOrigin="anonymous"
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, mt: 0.5 }}>
          <StorefrontOutlinedIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
          <Typography sx={{ color: "#94a3b8", fontSize: 11 }}>
            Comprobante de consumo
          </Typography>
        </Box>
      </Box>

      {/* Separador plano */}
      <Box sx={{ height: 3, bgcolor: "#1f8dd6" }} />

      {/* Cuerpo blanco */}
      <Box sx={{ bgcolor: "white", px: 2.5, pt: 2, pb: 1.5 }}>

        {/* Destinatario */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", mb: 0.5 }}>
            PARA
          </Typography>
          <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 900, fontSize: 16, color: "#0a2540", lineHeight: 1.2 }}>
              {data.student.name}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>Grado {data.student.grade}</Typography>
          </Stack>
        </Box>

        {/* Período y fecha */}
        <Box sx={{ bgcolor: "#f8fafc", borderRadius: 1.5, px: 1.5, py: 1, mb: 2 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Período</Typography>
            <Typography sx={{ fontSize: 11, color: "#475569" }}>
              {toLocalDate(data.from)} — {toLocalDate(data.to)}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: "space-between", mt: 0.5 }}>
            <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Emitido</Typography>
            <Typography sx={{ fontSize: 11, color: "#475569" }}>
              {toLocalDate(new Date().toISOString())}
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ mb: 1.5, borderColor: "#e2e8f0" }} />

        <Typography sx={{ fontWeight: 900, fontSize: 10, color: "#64748b", letterSpacing: "0.1em", mb: 1.25 }}>
          DETALLE DE CONSUMOS
        </Typography>

        {data.sales.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "#94a3b8", textAlign: "center", py: 2 }}>
            Sin consumos en este período
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ mb: 1.5 }}>
            {data.sales.map((sale) => (
              <Box key={sale.id} sx={{ bgcolor: "#f8fafc", borderRadius: 1.5, px: 1.5, py: 1 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
                  <Typography sx={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                    {toLocalTime(sale.createdAt)}
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#0a2540" }}>
                    {formatCurrency(sale.total)}
                  </Typography>
                </Stack>
                <Stack spacing={0.5}>
                  {sale.items.map((item, i) => (
                    <Stack key={i} direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography sx={{ fontSize: 12, color: "#475569" }}>
                        {item.quantity > 1 ? `${item.quantity}× ` : ""}{item.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                        {formatCurrency(item.subtotal)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        {/* Recargas del período */}
        {isPrepaid && data.recharges.length > 0 && (
          <>
            <Divider sx={{ mb: 1.5, borderColor: "#e2e8f0" }} />
            <Typography sx={{ fontWeight: 900, fontSize: 10, color: "#64748b", letterSpacing: "0.1em", mb: 1.25 }}>
              RECARGAS DEL PERÍODO
            </Typography>
            <Stack spacing={1} sx={{ mb: 1.5 }}>
              {data.recharges.map((r) => (
                <Stack key={r.id} direction="row" sx={{ justifyContent: "space-between", alignItems: "center", bgcolor: "#f0fdf4", borderRadius: 1.5, px: 1.5, py: 0.75 }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{toLocalTime(r.createdAt)}</Typography>
                    {r.note && <Typography sx={{ fontSize: 11, color: "#475569" }}>{r.note}</Typography>}
                  </Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#16a34a" }}>+{formatCurrency(r.amount)}</Typography>
                </Stack>
              ))}
            </Stack>
          </>
        )}

        {/* Saldo actual */}
        {isPrepaid && (
          <>
            <Divider sx={{ mb: 1.5, borderColor: "#e2e8f0" }} />
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", px: 0.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Saldo actual</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 900, color: data.student.balance < 0 ? "#dc2626" : "#16a34a" }}>
                {data.student.balance < 0
                  ? `−${formatCurrency(Math.abs(data.student.balance))} (deuda)`
                  : formatCurrency(data.student.balance)}
              </Typography>
            </Stack>
          </>
        )}
      </Box>

      {/* Footer oscuro */}
      <Box sx={{
        bgcolor: "#0a2540", px: 2.5, py: 2,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box>
          <Typography sx={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: "0.08em" }}>TOTAL CONSUMIDO</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: "white", lineHeight: 1.2 }}>
            {formatCurrency(data.totalConsumed)}
          </Typography>
          {isPrepaid && data.totalRecharged > 0 && (
            <Typography sx={{ fontSize: 11, color: "#4ade80", fontWeight: 700, mt: 0.25 }}>
              Recargado: +{formatCurrency(data.totalRecharged)}
            </Typography>
          )}
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontSize: 10, color: "#64748b", fontWeight: 700, mb: 0.75 }}>ESTADO</Typography>
          {isPrepaid ? (
            <Box sx={{
              bgcolor: pazYSalvo ? "#16a34a" : "#dc2626",
              borderRadius: 1.5, px: 1.25, py: 0.6,
              display: "inline-flex", alignItems: "center", gap: 0.5,
            }}>
              <Typography sx={{ fontSize: 12, color: "white", fontWeight: 900 }}>
                <CheckCircleOutlinedIcon sx={{ fontSize: 13 }} />
              {pazYSalvo ? " Paz y Salvo" : " Saldo negativo"}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ bgcolor: "#1e3a5f", borderRadius: 1, px: 1, py: 0.5 }}>
              <Typography sx={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>
                Pago al cierre
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ── Componente principal ────────────────────────────────────────────────────
export function ReportsManager({ students }: Props) {
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);
  const [from, setFrom] = useState(toInputDate(new Date()));
  const [to, setTo] = useState(toInputDate(new Date()));
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const comprobanteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students.filter((s) => s.isActive && s.name.toLowerCase().includes(q)).slice(0, 6);
  }, [students, query]);

  const selectStudent = (s: StudentDto) => {
    setSelectedStudent(s);
    setQuery("");
    setShowDropdown(false);
    setReport(null);
  };

  const applyQuickRange = (range: { from: string; to: string }) => {
    setFrom(range.from);
    setTo(range.to);
    setReport(null);
  };

  const generate = useCallback(async () => {
    if (!selectedStudent) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/reports?studentId=${selectedStudent.id}&from=${from}&to=${to}`
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al generar reporte."); return; }
      setReport(data);
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }, [selectedStudent, from, to]);

  const downloadPdf = useCallback(async () => {
    if (!comprobanteRef.current || !report) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(comprobanteRef.current, { pixelRatio: 2 });
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(`<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <title>Comprobante — ${report.student.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial, sans-serif; }
    .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.15); }
    img { display: block; width: 340px; }
    .footer { margin-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print {
      @page { size: 110mm auto; margin: 10mm; }
      body { background: white; }
      .no-print { display: none; }
    }
  </style>
</head><body>
  <div class="card"><img src="${dataUrl}" /></div>
  <p class="footer">Comprobante generado por SnackieVerse · ${new Date().toLocaleDateString("es-CO")}</p>
  <p class="footer no-print" style="margin-top:16px; color:#475569;">
    Presiona <strong>Ctrl+P</strong> (o ⌘+P en Mac) y elige <strong>Guardar como PDF</strong>
  </p>
  <script>setTimeout(() => window.print(), 400);<\/script>
</body></html>`);
      win.document.close();
    } finally {
      setDownloading(false);
    }
  }, [report]);

  const sendWhatsApp = useCallback(async () => {
    if (!report || !comprobanteRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(comprobanteRef.current, { pixelRatio: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const filename = `comprobante-${report.student.name.replace(/\s+/g, "-")}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      const phone = report.student.guardianWhatsapp;

      // Móvil: compartir imagen directamente (abre WhatsApp u otras apps)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Comprobante ${report.student.name}`,
        });
      } else {
        // Escritorio: descarga la imagen y abre WhatsApp con texto
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = filename;
        a.click();
        if (phone) {
          setTimeout(() => {
            window.open(`https://wa.me/${phone}`, "_blank");
          }, 800);
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") {
        alert("No se pudo compartir la imagen.");
      }
    } finally {
      setDownloading(false);
    }
  }, [report]);

  return (
    <Stack spacing={3}>
      {/* Título */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <CalendarMonthOutlinedIcon sx={{ fontSize: 34, color: "#0a2540" }} />
        <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 900, color: "#0a2540" }}>
          Reportes y Comprobantes
        </Typography>
      </Stack>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #e2e8f0" }}>
        <Tab label="Individual" />
        <Tab label="Semanal" />
        <Tab label="Mensual" />
      </Tabs>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        {/* Búsqueda de estudiante */}
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#64748b", mb: 1 }}>
          Buscar estudiante
        </Typography>
        <Box ref={inputRef} sx={{ position: "relative", mb: 2 }}>
          <TextField
            placeholder="Nombre o apellido..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          {selectedStudent && (
            <Box sx={{
              mt: 1, display: "inline-flex", alignItems: "center", gap: 1,
              bgcolor: "#dbeafe", color: "#1d4ed8", borderRadius: 4,
              px: 1.5, py: 0.5, fontSize: 13, fontWeight: 800,
            }}>
              {selectedStudent.name} — {selectedStudent.grade}
              <CloseIcon
                onClick={() => { setSelectedStudent(null); setReport(null); }}
                sx={{ fontSize: 14, cursor: "pointer", ml: 0.5, verticalAlign: "middle" }}
              />
            </Box>
          )}
          {showDropdown && filteredStudents.length > 0 && (
            <Paper elevation={6} sx={{ position: "absolute", top: 40, left: 0, right: 0, zIndex: 20, borderRadius: 2, overflow: "hidden" }}>
              {filteredStudents.map((s) => (
                <Box key={s.id} onClick={() => selectStudent(s)}
                  sx={{ px: 2, py: 1.25, cursor: "pointer", "&:hover": { bgcolor: "#f8fafc" }, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{s.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: "#64748b" }}>{s.grade}</Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        {/* Rango de fechas */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>Desde</Typography>
            <TextField type="date" value={from} onChange={(e) => { setFrom(e.target.value); setReport(null); }}
              size="small" fullWidth />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>Hasta</Typography>
            <TextField type="date" value={to} onChange={(e) => { setTo(e.target.value); setReport(null); }}
              size="small" fullWidth />
          </Box>
        </Stack>

        {/* Atajos de fecha */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Button size="small" variant="contained"
            sx={{ bgcolor: "#f59e0b", "&:hover": { bgcolor: "#d97706" }, fontWeight: 800, fontSize: 12 }}
            onClick={() => applyQuickRange(getWeekRange())}>
            Esta semana
          </Button>
          <Button size="small" variant="contained"
            sx={{ bgcolor: "#f59e0b", "&:hover": { bgcolor: "#d97706" }, fontWeight: 800, fontSize: 12 }}
            onClick={() => applyQuickRange(getMonthRange())}>
            Este mes
          </Button>
          <Button size="small" variant="contained" startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <span>
            <AssessmentIcon sx={{ fontSize: 14 }} />
          </span>}
            disabled={!selectedStudent || loading}
            sx={{ bgcolor: "#1f8dd6", "&:hover": { bgcolor: "#1677b5" }, fontWeight: 800, fontSize: 12 }}
            onClick={generate}>
            {loading ? "Generando..." : "Generar"}
          </Button>
        </Stack>

        {error && (
          <Typography sx={{ color: "#dc2626", fontSize: 13, mb: 2 }}>{error}</Typography>
        )}

        {/* Comprobante */}
        {report && (
          <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
            <Typography sx={{ fontWeight: 900, fontSize: 15, color: "#0a2540" }}>
              Comprobante — {report.student.name}
            </Typography>

            <Comprobante data={report} innerRef={comprobanteRef} />

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={downloading ? <CircularProgress size={14} /> : <PictureAsPdfIcon />}
                onClick={downloadPdf}
                disabled={downloading}
                sx={{ fontWeight: 800, borderColor: "#e74c3c", color: "#e74c3c", "&:hover": { borderColor: "#c0392b", bgcolor: "#fff5f5" } }}
              >
                {downloading ? "Generando..." : "Enviar en PDF"}
              </Button>
              <Button
                variant="contained"
                startIcon={<WhatsAppIcon />}
                onClick={sendWhatsApp}
                sx={{ bgcolor: "#25D366", "&:hover": { bgcolor: "#1ebe5a" }, fontWeight: 800 }}
              >
                Enviar WhatsApp
                </Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
