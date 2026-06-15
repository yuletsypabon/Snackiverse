"use client";

import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState, useCallback } from "react";

import { formatCurrency } from "@/lib/currency";

type SaleRow = {
  saleId: string;
  createdAt: string;
  studentName: string;
  studentGrade: string;
  guardianWhatsapp: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  vendorName: string;
};

type StudentEntry = {
  id: string;
  name: string;
  grade: string;
  type: string;
  balance: number;
  guardianWhatsapp?: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  prepaid: "saldo",
  weekly: "semanal",
  monthly: "mensual",
  biweekly: "quincenal",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

// ── Tab 1: Ventas detalladas ───────────────────────────────────────────────
export function VentasDetalladas() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  // page: página actual. total: número de ventas en el rango (no ítems).
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 100;

  // currentPage se pasa como parámetro para poder llamar load() con la página
  // correcta sin depender del estado (que puede estar desactualizado en el cierre).
  const load = useCallback(async (currentPage = 1) => {
    if (!from || !to) { setError("Selecciona un rango de fechas."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(
        `/api/reports/sales?from=${from}&to=${to}&page=${currentPage}&pageSize=${PAGE_SIZE}`
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setRows(data.rows);
      setTotal(data.total);   // total de ventas en el rango (para calcular páginas)
      setLoaded(true);
    } catch { setError("Error de conexión."); }
    finally { setLoading(false); }
  }, [from, to]);

  // Cuando el usuario hace clic en "Cargar", siempre empieza desde la página 1.
  const handleLoad = useCallback(() => {
    setPage(1);
    load(1);
  }, [load]);

  // Cambiar de página: actualiza el estado y dispara el fetch.
  const goToPage = useCallback((next: number) => {
    setPage(next);
    load(next);
  }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const totalGeneral = rows.reduce((s, r) => s + r.subtotal, 0);

  return (
    <Stack spacing={2.5}>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "flex-end" }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>Desde</Typography>
            <TextField type="date" value={from} onChange={(e) => setFrom(e.target.value)} size="small" fullWidth />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>Hasta</Typography>
            <TextField type="date" value={to} onChange={(e) => setTo(e.target.value)} size="small" fullWidth />
          </Box>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <RefreshOutlinedIcon />}
            onClick={handleLoad}
            disabled={loading}
            sx={{ bgcolor: "#1f8dd6", "&:hover": { bgcolor: "#1677b5" }, fontWeight: 800, minWidth: 110 }}
          >
            {loading ? "Cargando..." : "Cargar"}
          </Button>
        </Stack>
        {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
      </Paper>

      {loaded && (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden" }}>
          {rows.length === 0 ? (
            <Typography sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
              Sin ventas en este período.
            </Typography>
          ) : (
            <>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 750 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      {["FECHA", "ESTUDIANTE", "GRADO", "PRODUCTO", "CANT.", "VALOR", "VENDEDOR", "TELÉFONO"].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 900, fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r, i) => (
                      <TableRow key={`${r.saleId}-${i}`} hover>
                        <TableCell sx={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{formatDate(r.createdAt)}</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>{r.studentName}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{r.studentGrade}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{r.quantity > 1 ? `${r.quantity}× ` : ""}{r.productName}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{r.quantity}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#16a34a", fontSize: 13 }}>{formatCurrency(r.subtotal)}</TableCell>
                        <TableCell sx={{ fontSize: 13, color: "#475569" }}>{r.vendorName}</TableCell>
                        <TableCell sx={{ fontSize: 12, color: "#94a3b8" }}>{r.guardianWhatsapp ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ px: 3, py: 1.5, bgcolor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                  {total} venta{total !== 1 ? "s" : ""} en el período
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: 15, color: "#0a2540" }}>
                  Total: {formatCurrency(totalGeneral)}
                </Typography>
              </Box>
              {/* Controles de paginación — solo aparecen si hay más de una página */}
              {totalPages > 1 && (
                <Box sx={{ px: 3, py: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 2, borderTop: "1px solid #f1f5f9" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={page === 1 || loading}
                    onClick={() => goToPage(page - 1)}
                  >
                    Anterior
                  </Button>
                  <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                    Página {page} de {totalPages}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={page === totalPages || loading}
                    onClick={() => goToPage(page + 1)}
                  >
                    Siguiente
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      )}
    </Stack>
  );
}

// ── Tab 2: Paz y Salvo ────────────────────────────────────────────────────
export function PazYSalvo() {
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/paz-y-salvo");
      const data = await res.json();
      setStudents(data.students ?? []);
      setLoaded(true);
    } finally { setLoading(false); }
  }, []);

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
        <CheckCircleOutlinedIcon sx={{ color: "#16a34a" }} />
        <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Usuarios Paz y Salvo</Typography>
      </Stack>
      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
        Estudiantes sin deudas pendientes.
      </Typography>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <RefreshOutlinedIcon />}
        onClick={load}
        disabled={loading}
        sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" }, fontWeight: 800, mb: 2.5 }}
      >
        {loading ? "Cargando..." : "Actualizar"}
      </Button>

      {loaded && (
        students.length === 0 ? (
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>No hay estudiantes paz y salvo.</Typography>
        ) : (
          <Stack spacing={0}>
            {students.map((s, i) => (
              <Box key={s.id}>
                {i > 0 && <Divider />}
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{s.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                      {s.grade} · {TYPE_LABELS[s.type] ?? s.type}
                    </Typography>
                  </Box>
                  <Chip
                    label="Al día"
                    size="small"
                    icon={<CheckCircleOutlinedIcon />}
                    sx={{ bgcolor: "#d7f4e4", color: "#008c49", fontWeight: 900, "& .MuiChip-icon": { color: "#008c49", fontSize: 13 } }}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        )
      )}
    </Paper>
  );
}

// ── Tab 3: Deudores ────────────────────────────────────────────────────────
export function Deudores() {
  const [type, setType] = useState("all");
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/deudores?type=${type}`);
      const data = await res.json();
      setStudents(data.students ?? []);
      setLoaded(true);
    } finally { setLoading(false); }
  }, [type]);

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <WarningAmberOutlinedIcon sx={{ color: "#f59e0b" }} />
        <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Usuarios Deudores</Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "flex-end", mb: 2.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>Tipo</Typography>
          <FormControl size="small" fullWidth>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="prepaid">Prepago (saldo negativo)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <RefreshOutlinedIcon />}
          onClick={load}
          disabled={loading}
          sx={{ bgcolor: "#e74c3c", "&:hover": { bgcolor: "#c0392b" }, fontWeight: 800, minWidth: 110 }}
        >
          {loading ? "Cargando..." : "Cargar"}
        </Button>
      </Stack>

      {loaded && (
        students.length === 0 ? (
          <Alert severity="success">No hay deudores. ¡Todo al día!</Alert>
        ) : (
          <Stack spacing={0}>
            {students.map((s, i) => (
              <Box key={s.id}>
                {i > 0 && <Divider />}
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{s.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                      {s.grade} · {TYPE_LABELS[s.type] ?? s.type}
                      {s.guardianWhatsapp ? ` · ${s.guardianWhatsapp}` : ""}
                    </Typography>
                  </Box>
                  <Chip
                    label={formatCurrency(s.balance)}
                    size="small"
                    sx={{ bgcolor: "#fde1dd", color: "#bf1f14", fontWeight: 900, fontSize: 13 }}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        )
      )}
    </Paper>
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export function ReportsCenterManager() {
  const [tab, setTab] = useState(0);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <ReceiptLongOutlinedIcon sx={{ fontSize: 24, color: "#0a2540" }} />
        <Typography variant="h5" sx={{ fontWeight: 900, color: "#0a2540" }}>
          Centro de Informes
        </Typography>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: "1px solid #e2e8f0" }}
        variant="scrollable"
      >
        <Tab label="Ventas detalladas" icon={<AssessmentOutlinedIcon sx={{ fontSize: 15 }} />} iconPosition="start" />
        <Tab label="Paz y Salvo" icon={<CheckCircleOutlinedIcon sx={{ fontSize: 15 }} />} iconPosition="start" />
        <Tab label="Deudores" icon={<WarningAmberOutlinedIcon sx={{ fontSize: 15 }} />} iconPosition="start" />
      </Tabs>

      <Box>
        {tab === 0 && <VentasDetalladas />}
        {tab === 1 && <PazYSalvo />}
        {tab === 2 && <Deudores />}
      </Box>
    </Stack>
  );
}
