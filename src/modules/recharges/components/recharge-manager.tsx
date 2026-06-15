"use client";

import AddCardOutlinedIcon from "@mui/icons-material/AddCardOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState, useMemo, useEffect, useRef } from "react";

import { formatCurrency } from "@/lib/currency";
import type { StudentDto } from "@/modules/students/schemas/student.schema";
import type { RechargeDto } from "@/modules/recharges/schemas/recharge.schema";

type Props = { students: StudentDto[] };

function toLocalDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export function RechargeManager({ students }: Props) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<RechargeDto[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const inputRef = useRef<HTMLDivElement>(null);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students.filter((s) => s.isActive && s.name.toLowerCase().includes(q)).slice(0, 6);
  }, [students, query]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/recharges");
      const data = await res.json();
      if (res.ok) setHistory(data.recharges ?? []);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectStudent = (s: StudentDto) => {
    setSelectedStudent(s);
    setQuery("");
    setShowDropdown(false);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedStudent) { setError("Selecciona un estudiante."); return; }
    const amt = parseInt(amount, 10);
    if (!amt || amt < 100) { setError("El monto mínimo es $100."); return; }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/recharges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent.id, amount: amt, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No se pudo aplicar la recarga."); return; }

      setSuccess(
        `Recarga de ${formatCurrency(amt)} aplicada a ${selectedStudent.name}. Nuevo saldo: ${formatCurrency(data.recharge.balanceAfter)}`
      );
      setSelectedStudent(null);
      setAmount("");
      setNote("");
      await fetchHistory();
      setTimeout(() => setSuccess(null), 6000);
    } catch {
      setError("Error de conexión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <SavingsOutlinedIcon sx={{ fontSize: 24, color: "#0a2540" }} />
        <Typography variant="h5" sx={{ fontWeight: 900, color: "#0a2540" }}>
          Recargas
        </Typography>
      </Stack>

      <Grid container spacing={2.5} sx={{ alignItems: "flex-start" }}>
        {/* ── Formulario ── */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2.5 }}>
              <AddCardOutlinedIcon sx={{  fontSize: 20 }} />
              <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Nueva Recarga</Typography>
            </Stack>

            {/* Buscador de estudiante */}
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>
              Buscar estudiante
            </Typography>
            <Box sx={{ position: "relative", mb: 2 }} ref={inputRef}>
              <TextField
                placeholder="Nombre..."
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
                <Stack direction="row" spacing={1} sx={{ mt: 1.25, alignItems: "center" }}>
                  <Chip
                    label={`${selectedStudent.name} — ${selectedStudent.grade}`}
                    onDelete={() => setSelectedStudent(null)}
                    sx={{ bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 800 }}
                  />
                  <Chip
                    label={formatCurrency(selectedStudent.balance)}
                    size="small"
                    sx={{
                      bgcolor: selectedStudent.balance < 0 ? "#fee2e2" : "#dcfce7",
                      color: selectedStudent.balance < 0 ? "#dc2626" : "#16a34a",
                      fontWeight: 900,
                    }}
                  />
                </Stack>
              )}
              {showDropdown && filteredStudents.length > 0 && (
                <Paper elevation={6} sx={{ position: "absolute", top: 40, left: 0, right: 0, zIndex: 20, borderRadius: 2, overflow: "hidden" }}>
                  {filteredStudents.map((s) => (
                    <Box key={s.id} onClick={() => selectStudent(s)}
                      sx={{ px: 2, py: 1.25, cursor: "pointer", "&:hover": { bgcolor: "#f8fafc" }, borderBottom: "1px solid #f1f5f9" }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{s.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                        {s.grade} · {formatCurrency(s.balance)}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>

            {/* Monto */}
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>
              Monto a recargar ($)
            </Typography>
            <TextField
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
              slotProps={{ htmlInput: { min: 100, step: 500 } }}
            />

            {/* Nota */}
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>
              Nota (opcional)
            </Typography>
            <TextField
              placeholder="Ej: Pago semana 1"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 2.5 }}
            />

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleOutlinedIcon />}>{success}</Alert>}

            <Button
              variant="contained"
              fullWidth
              disabled={submitting || !selectedStudent}
              onClick={handleSubmit}
              sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" }, "&:disabled": { bgcolor: "#86efac", color: "white" }, fontWeight: 900, py: 1.5, fontSize: 15 }}
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : "Aplicar Recarga"}
            </Button>
          </Paper>
        </Grid>

        {/* ── Historial ── */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
              <HistoryOutlinedIcon sx={{ color: "#475569", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Historial</Typography>
            </Stack>

            {loadingHistory ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : history.length === 0 ? (
              <Typography sx={{ color: "#94a3b8", fontSize: 13, textAlign: "center", py: 4 }}>
                Sin recargas
              </Typography>
            ) : (
              <Stack spacing={0}>
                {history.map((r, i) => (
                  <Box key={r.id}>
                    {i > 0 && <Divider />}
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                          {r.studentName}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                          {r.studentGrade} · {toLocalDateTime(r.createdAt)}
                          {r.note && ` · ${r.note}`}
                        </Typography>
                      </Box>
                      <Stack sx={{ alignItems: "flex-end", gap: 0.5 }}>
                        <Chip
                          label={`+${formatCurrency(r.amount)}`}
                          size="small"
                          sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontWeight: 900 }}
                        />
                        <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                          Saldo: {formatCurrency(r.balanceAfter)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
