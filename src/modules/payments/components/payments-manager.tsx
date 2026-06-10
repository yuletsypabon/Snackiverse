"use client";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SearchIcon from "@mui/icons-material/Search";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState, useMemo, useRef, useEffect } from "react";

import { formatCurrency } from "@/lib/currency";
import type { StudentDto } from "@/modules/students/schemas/student.schema";
import type { PaymentDto } from "../services/payment.service";

type Props = {
  students: StudentDto[];
  initialPayments: PaymentDto[];
};

const METHOD_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  otro: "Otro",
};

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  efectivo:      { bg: "#d7f4e4", color: "#008c49" },
  transferencia: { bg: "#d8ecfb", color: "#0065a8" },
  otro:          { bg: "#f1f5f9", color: "#475569" },
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export function PaymentsManager({ students, initialPayments }: Props) {
  const [payments, setPayments] = useState<PaymentDto[]>(initialPayments);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);
  const [amount, setAmount] = useState("0");
  const [method, setMethod] = useState("efectivo");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter((s) => s.isActive && (s.type === "weekly" || s.type === "monthly" || s.type === "biweekly") && s.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [students, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) { setError("Selecciona un estudiante."); return; }
    const amountNum = parseInt(amount, 10);
    if (!amountNum || amountNum <= 0) { setError("El monto debe ser mayor a 0."); return; }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent.id, amount: amountNum, method, note }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al registrar el pago."); return; }
      setPayments((prev) => [data.payment, ...prev]);
      setSelectedStudent(null);
      setQuery("");
      setAmount("0");
      setNote("");
      setMethod("efectivo");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Título */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <CreditCardOutlinedIcon sx={{ fontSize: 24, color: "#0a2540" }} />
        <Typography variant="h5" sx={{ fontWeight: 900, color: "#0a2540" }}>
          Registro de Pagos
        </Typography>
      </Stack>

      <Grid container spacing={2.5} sx={{ alignItems: "flex-start" }}>
        {/* ── Formulario ── */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2.5 }}>
              <CheckCircleOutlinedIcon sx={{ color: "#16a34a", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Registrar Pago</Typography>
            </Stack>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.25}>
                {/* Estudiante */}
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>
                    Estudiante (tiquetera semanal o mensual)
                  </Typography>
                  <Box ref={inputRef} sx={{ position: "relative" }}>
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
                      <Chip
                        label={`${selectedStudent.name} — ${selectedStudent.grade}`}
                        onDelete={() => { setSelectedStudent(null); setQuery(""); }}
                        sx={{ mt: 1, bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 800 }}
                      />
                    )}
                    {showDropdown && filteredStudents.length > 0 && (
                      <Paper elevation={6} sx={{ position: "absolute", top: 38, left: 0, right: 0, zIndex: 20, borderRadius: 2, overflow: "hidden" }}>
                        {filteredStudents.map((s) => (
                          <Box key={s.id}
                            onClick={() => { setSelectedStudent(s); setQuery(""); setShowDropdown(false); }}
                            sx={{ px: 2, py: 1.25, cursor: "pointer", "&:hover": { bgcolor: "#f8fafc" }, borderBottom: "1px solid #f1f5f9" }}
                          >
                            <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{s.name}</Typography>
                            <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                              {s.grade} · {s.type === "weekly" ? "Semanal" : s.type === "monthly" ? "Mensual" : "Quincenal"}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    )}
                  </Box>
                </Box>

                {/* Monto */}
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>Monto ($)</Typography>
                  <TextField
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, step: 100 } }}
                  />
                </Box>

                {/* Fecha */}
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>Fecha del pago</Typography>
                  <TextField
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    size="small"
                    fullWidth
                  />
                </Box>

                {/* Medio de pago */}
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>Medio de pago</Typography>
                  <FormControl size="small" fullWidth>
                    <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                      <MenuItem value="efectivo"><AttachMoneyIcon sx={{ fontSize: 15, mr: 0.75, verticalAlign: "middle" }} />Efectivo</MenuItem>
                      <MenuItem value="transferencia"><AccountBalanceOutlinedIcon sx={{ fontSize: 15, mr: 0.75, verticalAlign: "middle" }} />Transferencia</MenuItem>
                      <MenuItem value="otro"><MoreHorizIcon sx={{ fontSize: 15, mr: 0.75, verticalAlign: "middle" }} />Otro</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Nota */}
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 0.75 }}>Nota</Typography>
                  <TextField
                    placeholder="Opcional"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    size="small"
                    fullWidth
                  />
                </Box>

                {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
                {success && <Alert severity="success" icon={<CheckCircleOutlinedIcon />}>¡Pago registrado correctamente!</Alert>}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlinedIcon />}
                  sx={{
                    bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" },
                    fontWeight: 900, fontSize: 15, py: 1.25,
                  }}
                >
                  {saving ? "Registrando..." : "Registrar Pago"}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* ── Historial ── */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2.5 }}>
              <HistoryOutlinedIcon sx={{ color: "#475569", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Historial</Typography>
            </Stack>

            {payments.length === 0 ? (
              <Typography sx={{ color: "text.secondary", textAlign: "center", py: 5, fontSize: 13 }}>
                No hay pagos registrados aún.
              </Typography>
            ) : (
              <Stack spacing={0}>
                {payments.map((p, i) => {
                  const colors = METHOD_COLORS[p.method] ?? METHOD_COLORS.otro;
                  return (
                    <Box key={p.id}>
                      {i > 0 && <Divider sx={{ my: 0 }} />}
                      <Stack
                        direction="row"
                        sx={{ alignItems: "center", justifyContent: "space-between", py: 1.75, px: 0.5 }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#0a2540" }}>
                            {p.studentName}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.5, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                              {formatDateTime(p.createdAt)}
                            </Typography>
                            <Chip
                              label={METHOD_LABELS[p.method] ?? p.method}
                              size="small"
                              sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 800, fontSize: 11, height: 20 }}
                            />
                            {p.note && (
                              <Typography sx={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
                                {p.note}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                        <Typography sx={{ fontWeight: 900, fontSize: 15, color: "#16a34a", ml: 2, flexShrink: 0 }}>
                          +{formatCurrency(p.amount)}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
