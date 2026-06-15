import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import MoneyOffOutlinedIcon from "@mui/icons-material/MoneyOffOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { getDashboardData } from "@/modules/dashboard/services/dashboard.service";
import { formatCurrency } from "@/lib/currency";
import { getSessionUser } from "@/lib/api-auth";

function formatDashboardDate() {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" }).format(d);
  const time = new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit" }).format(d);
  return { date, time };
}

export default async function DashboardPage() {
  const [data, session] = await Promise.all([getDashboardData(), getSessionUser()]);

  // Comparativa ventas hoy vs ayer
  const trend = data.salesYesterdayTotal > 0
    ? ((data.salesTodayTotal - data.salesYesterdayTotal) / data.salesYesterdayTotal) * 100
    : null;

  const stats = [
    {
      label: "VENTAS HOY",
      value: formatCurrency(data.salesTodayTotal),
      detail: `${data.salesCountToday} venta${data.salesCountToday !== 1 ? "s" : ""} registrada${data.salesCountToday !== 1 ? "s" : ""}`,
      icon: PointOfSaleOutlinedIcon,
      color: "#27ae60",
      trend,
    },
    {
      label: "ESTUDIANTES",
      value: String(data.studentCount),
      detail: "Activos registrados",
      icon: BadgeOutlinedIcon,
      color: "#1f8dd6",
      trend: null,
    },
    {
      label: "DEUDORES",
      value: String(data.deudoresCount),
      detail: "Con saldo negativo",
      icon: ErrorOutlineOutlinedIcon,
      color: "#e74c3c",
      trend: null,
    },
    {
      label: "PRODUCTOS",
      value: String(data.productCount),
      detail: "En catálogo activo",
      icon: RestaurantMenuOutlinedIcon,
      color: "#7c3aed",
      trend: null,
    },
  ];

  // Token sizes uniformes
  const T = {
    sectionTitle: { xs: 13, sm: 15 } as const,
    sectionIcon: { xs: 16, sm: 19 } as const,
    body: { xs: 12, sm: 13 } as const,
    secondary: { xs: 11, sm: 11 } as const,
    paperPad: { xs: 1.25, sm: 2 } as const,
  };

  return (
    <AdminShell activeHref="/dashboard" role={session?.role}>
      <Stack spacing={{ xs: 1.5, md: 2.5 }}>

        {/* Encabezado */}
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <HomeOutlinedIcon sx={{ fontSize: 24, color: "#0a2540" }} />
            <Typography variant="h5" sx={{ color: "#0a2540", fontWeight: 900 }}>
              Panel Principal
            </Typography>
          </Stack>
          <Typography sx={{ color: "text.secondary", mt: 0.25, fontSize: { xs: 11, sm: 13 } }}>
            {formatDashboardDate()}
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={{ xs: 1, sm: 1.5 }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
                <Paper elevation={0} sx={{ bgcolor: stat.color, color: "white", p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
                  <Stack direction="row" sx={{ alignItems: "center", mb: 0.5 }}>
                    <Typography sx={{ flexGrow: 1, fontWeight: 900, fontSize: { xs: 10, sm: 11 }, letterSpacing: "0.08em", opacity: 0.9 }}>
                      {stat.label}
                    </Typography>
                    <Icon sx={{ fontSize: { xs: 16, sm: 18 }, opacity: 0.7 }} />
                  </Stack>
                  <Typography sx={{ fontSize: { xs: 24, sm: 30 }, fontWeight: 900, lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Stack direction="row" sx={{ alignItems: "center", mt: 0.5, gap: 0.5, flexWrap: "wrap" }}>
                    <Typography sx={{ opacity: 0.85, fontSize: { xs: 10, sm: 11 } }}>{stat.detail}</Typography>
                    {stat.trend !== null && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, opacity: 0.9 }}>
                        {stat.trend >= 0
                          ? <TrendingUpOutlinedIcon sx={{ fontSize: 13 }} />
                          : <TrendingDownOutlinedIcon sx={{ fontSize: 13 }} />}
                        <Typography sx={{ fontSize: 10, fontWeight: 700 }}>
                          {Math.abs(stat.trend).toFixed(0)}%
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Últimas ventas + lateral */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {/* Últimas ventas */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper elevation={0} sx={{ p: T.paperPad, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: { xs: 1.5, sm: 2 } }}>
                <AssessmentOutlinedIcon sx={{ fontSize: T.sectionIcon, color: "primary.main" }} />
                <Typography component="h2" sx={{ fontWeight: 900, fontSize: T.sectionTitle }}>Últimas ventas</Typography>
                {data.salesCountToday > 0 && (
                  <Chip label={`${data.salesCountToday} hoy`} size="small"
                    sx={{ bgcolor: "#d7f4e4", color: "#008c49", fontWeight: 800, fontSize: 10 }} />
                )}
              </Stack>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 380 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 900, fontSize: 10, color: "#64748b", letterSpacing: "0.06em", py: 1 }}>FECHA</TableCell>
                      <TableCell sx={{ fontWeight: 900, fontSize: 10, color: "#64748b", letterSpacing: "0.06em", py: 1 }}>ESTUDIANTE</TableCell>
                      <TableCell sx={{ fontWeight: 900, fontSize: 10, color: "#64748b", letterSpacing: "0.06em", py: 1, display: { xs: "none", md: "table-cell" } }}>VENDEDOR</TableCell>
                      <TableCell sx={{ fontWeight: 900, fontSize: 10, color: "#64748b", letterSpacing: "0.06em", py: 1, display: { xs: "none", sm: "table-cell" } }}>ÍTEMS</TableCell>
                      <TableCell sx={{ fontWeight: 900, fontSize: 10, color: "#64748b", letterSpacing: "0.06em", py: 1 }} align="right">TOTAL</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ color: "text.secondary", py: 4, textAlign: "center", fontSize: T.body }}>
                          Sin ventas aún
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.recentSales.map((sale) => {
                        const { date, time } = formatDateTime(sale.createdAt);
                        return (
                          <TableRow key={sale.id} hover>
                            <TableCell sx={{ py: 1 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: T.body, color: "#1e293b" }}>{time}</Typography>
                              <Typography sx={{ fontSize: T.secondary, color: "#94a3b8" }}>{date}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: T.body }}>{sale.studentName}</Typography>
                              {sale.studentGrade && (
                                <Typography sx={{ color: "#94a3b8", fontSize: T.secondary }}>{sale.studentGrade}</Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ py: 1, display: { xs: "none", md: "table-cell" } }}>
                              <Typography sx={{ fontSize: T.body, color: "#475569" }}>{sale.vendorName}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1, display: { xs: "none", sm: "table-cell" } }}>
                              <Chip label={`${sale.itemCount}`} size="small"
                                sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 700, fontSize: 10 }} />
                            </TableCell>
                            <TableCell sx={{ py: 1 }} align="right">
                              <Typography sx={{ fontWeight: 900, color: "#16a34a", fontSize: T.body }}>
                                {formatCurrency(sale.total)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {data.recentSales.length > 0 && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: T.secondary, color: "#94a3b8" }}>
                    Últimas {data.recentSales.length} ventas
                  </Typography>
                  <Typography sx={{ fontSize: T.body, fontWeight: 900, color: "#0a2540" }}>
                    Hoy: {formatCurrency(data.salesTodayTotal)}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Columna derecha */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={{ xs: 1.5, sm: 2 }}>

              {/* Deudores */}
              <Paper elevation={0} sx={{ p: T.paperPad, borderRadius: 2 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: { xs: 1, sm: 1.5 } }}>
                  <MoneyOffOutlinedIcon sx={{ color: "#dc2626", fontSize: T.sectionIcon }} />
                  <Typography component="h2" sx={{ fontWeight: 900, fontSize: T.sectionTitle }}>Deudores</Typography>
                  {data.debtorStudents.length > 0 && (
                    <Chip label={data.debtorStudents.length} size="small"
                      sx={{ bgcolor: "#fee2e2", color: "#dc2626", fontWeight: 900, fontSize: 10 }} />
                  )}
                </Stack>
                {data.debtorStudents.length === 0 ? (
                  <Typography sx={{ color: "#94a3b8", fontSize: T.body, textAlign: "center", py: 2 }}>Sin deudores</Typography>
                ) : (
                  <Stack spacing={0}>
                    {data.debtorStudents.map((s, i) => (
                      <Box key={s.id}>
                        {i > 0 && <Divider />}
                        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", py: 1 }}>
                          <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: T.body }}>{s.name}</Typography>
                            <Typography sx={{ fontSize: T.secondary, color: "#94a3b8" }}>{s.grade}</Typography>
                          </Box>
                          <Chip label={formatCurrency(s.balance)} size="small"
                            sx={{ bgcolor: "#fee2e2", color: "#dc2626", fontWeight: 900, fontSize: 10 }} />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>

              {/* Tiqueteras por vencer */}
              <Paper elevation={0} sx={{ p: T.paperPad, borderRadius: 2 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: { xs: 1, sm: 1.5 } }}>
                  <EventBusyOutlinedIcon sx={{ color: "#f59e0b", fontSize: T.sectionIcon }} />
                  <Typography component="h2" sx={{ fontWeight: 900, fontSize: T.sectionTitle }}>Tiqueteras por vencer</Typography>
                  {data.expiringTiqueteras.length > 0 && (
                    <Chip label={data.expiringTiqueteras.length} size="small"
                      sx={{ bgcolor: "#fff7ed", color: "#c2410c", fontWeight: 900, fontSize: 10 }} />
                  )}
                </Stack>
                {data.expiringTiqueteras.length === 0 ? (
                  <Typography sx={{ color: "#94a3b8", fontSize: T.body, textAlign: "center", py: 2 }}>Sin vencimientos próximos</Typography>
                ) : (
                  <Stack spacing={0}>
                    {data.expiringTiqueteras.map((s, i) => {
                      const daysLeft = Math.ceil((new Date(s.expiresAt).getTime() - new Date().setHours(0,0,0,0)) / 86400000);
                      const urgent = daysLeft <= 2;
                      return (
                        <Box key={s.id}>
                          {i > 0 && <Divider />}
                          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", py: 1 }}>
                            <Box>
                              <Typography sx={{ fontWeight: 800, fontSize: T.body }}>{s.name}</Typography>
                              <Typography sx={{ fontSize: T.secondary, color: "#94a3b8" }}>
                                {s.grade} · {s.type === "weekly" ? "Semanal" : s.type === "biweekly" ? "Quincenal" : "Mensual"}
                              </Typography>
                            </Box>
                            <Chip
                              label={daysLeft === 0 ? "Hoy" : daysLeft === 1 ? "Mañana" : `${daysLeft}d`}
                              size="small"
                              sx={{ bgcolor: urgent ? "#fee2e2" : "#fff7ed", color: urgent ? "#dc2626" : "#c2410c", fontWeight: 900, fontSize: 10 }}
                            />
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
                   </Paper>

            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </AdminShell>
  );
}
