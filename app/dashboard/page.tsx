import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { getDashboardData } from "@/modules/dashboard/services/dashboard.service";
import { formatCurrency } from "@/lib/currency";

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
  const data = await getDashboardData();

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
      icon: GroupsOutlinedIcon,
      color: "#1f8dd6",
      trend: null,
    },
    {
      label: "DEUDORES",
      value: String(data.morososCount),
      detail: "Con saldo negativo",
      icon: ErrorOutlineOutlinedIcon,
      color: "#e74c3c",
      trend: null,
    },
    {
      label: "PRODUCTOS",
      value: String(data.productCount),
      detail: "En catálogo activo",
      icon: Inventory2OutlinedIcon,
      color: "#7c3aed",
      trend: null,
    },
  ];

  return (
    <AdminShell activeHref="/dashboard">
      <Stack spacing={3}>
        {/* Encabezado */}
        <Box>
          <Typography
            component="h1"
            sx={{
              color: "#0a2540",
              fontSize: { xs: 28, md: 34 },
              fontWeight: 900,
              lineHeight: 1.1,
            }}
          >
            Panel Principal
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.75 }}>
            {formatDashboardDate()}
          </Typography>
        </Box>

        {/* Tarjetas de stats */}
        <Grid container spacing={2}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Grid key={stat.label} size={{ xs: 12, sm: 6, xl: 3 }}>
                <Paper
                  elevation={0}
                  sx={{ bgcolor: stat.color, color: "white", minHeight: 120, p: 2.5, borderRadius: 2 }}
                >
                  <Stack direction="row" sx={{ alignItems: "center" }}>
                    <Typography sx={{ flexGrow: 1, fontWeight: 900, fontSize: 13, letterSpacing: "0.06em" }}>
                      {stat.label}
                    </Typography>
                    <Icon sx={{ fontSize: 22, opacity: 0.8 }} />
                  </Stack>
                  <Typography sx={{ fontSize: 38, fontWeight: 900, lineHeight: 1, mt: 1.25 }}>
                    {stat.value}
                  </Typography>
                  <Stack direction="row" sx={{ alignItems: "center", mt: 1, gap: 0.75 }}>
                    <Typography sx={{ opacity: 0.9, fontSize: 13 }}>{stat.detail}</Typography>
                    {stat.trend !== null && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, opacity: 0.9 }}>
                        {stat.trend >= 0
                          ? <TrendingUpOutlinedIcon sx={{ fontSize: 16 }} />
                          : <TrendingDownOutlinedIcon sx={{ fontSize: 16 }} />}
                        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                          {Math.abs(stat.trend).toFixed(0)}% vs ayer
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Últimas ventas + Alertas */}
        <Grid container spacing={2.5}>
          {/* Últimas ventas */}
          <Grid size={{ xs: 12, xl: 7 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2.5 }}>
                <AssessmentOutlinedIcon color="primary" />
                <Typography component="h2" sx={{ fontWeight: 900, fontSize: 16 }}>
                  Últimas ventas
                </Typography>
                {data.salesCountToday > 0 && (
                  <Chip
                    label={`${data.salesCountToday} hoy`}
                    size="small"
                    sx={{ bgcolor: "#d7f4e4", color: "#008c49", fontWeight: 800, fontSize: 11 }}
                  />
                )}
              </Stack>

              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 900, fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }}>FECHA</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }}>ESTUDIANTE</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }}>REGISTRADO POR</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }}>ÍTEMS</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }} align="right">TOTAL</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recentSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ color: "text.secondary", py: 5, textAlign: "center" }}>
                        Sin ventas aún
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recentSales.map((sale) => {
                      const { date, time } = formatDateTime(sale.createdAt);
                      return (
                        <TableRow key={sale.id} hover>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{time}</Typography>
                            <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>{date}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{sale.studentName}</Typography>
                            {sale.studentGrade && (
                              <Typography sx={{ color: "#94a3b8", fontSize: 11 }}>{sale.studentGrade}</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 13, color: "#475569" }}>{sale.vendorName}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${sale.itemCount} ítem${sale.itemCount !== 1 ? "s" : ""}`}
                              size="small"
                              sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 700, fontSize: 11 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontWeight: 900, color: "#16a34a", fontSize: 14 }}>
                              {formatCurrency(sale.total)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              {/* Total del período visible */}
              {data.recentSales.length > 0 && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                    Mostrando las últimas {data.recentSales.length} ventas
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 900, color: "#0a2540" }}>
                    Hoy: {formatCurrency(data.salesTodayTotal)}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </AdminShell>
  );
}
