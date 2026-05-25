import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
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

const stats = [
    {
        label: "VENTAS HOY",
        value: "$0",
        detail: "Total del día",
        icon: PointOfSaleOutlinedIcon,
        color: "#27ae60",
    },
    {
        label: "ESTUDIANTES",
        value: "6",
        detail: "Registrados",
        icon: GroupsOutlinedIcon,
        color: "#1f8dd6",
    },
    {
        label: "MOROSOS",
        value: "0",
        detail: "Con deuda",
        icon: ErrorOutlineOutlinedIcon,
        color: "#e74c3c",
    },
    {
        label: "PRODUCTOS",
        value: "12",
        detail: "Catálogo",
        icon: Inventory2OutlinedIcon,
        color: "#7c3aed",
    },
];

function formatDashboardDate() {
    return new Intl.DateTimeFormat("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date());
}

export default function DashboardPage() {
    return (
        <AdminShell activeHref="/dashboard">
            <Stack spacing={3}>
                <Box>
                    <Typography
                        component="h1"
                        sx={{
                            color: "#0a2540",
                            fontSize: { xs: 28, md: 34 },
                            fontWeight: 900,
                            lineHeight: 1.1,
                            textShadow: "2px 2px 0 #7eb7ed",
                        }}
                    >
                        Panel Principal 👋
                    </Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1 }}>
                        {formatDashboardDate()}
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <Grid key={stat.label} size={{ xs: 12, md: 6, xl: 3 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        bgcolor: stat.color,
                                        color: "white",
                                        minHeight: 126,
                                        p: 2.5,
                                    }}
                                >
                                    <Stack direction="row" sx={{ alignItems: "center" }}>
                                        <Typography sx={{ flexGrow: 1, fontWeight: 900 }}>
                                            {stat.label}
                                        </Typography>
                                        <Icon />
                                    </Stack>
                                    <Typography
                                        sx={{
                                            fontSize: 38,
                                            fontWeight: 900,
                                            lineHeight: 1,
                                            mt: 1.5,
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    <Typography sx={{ mt: 1.5, opacity: 0.95 }}>
                                        {stat.detail}
                                    </Typography>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, xl: 6 }}>
                        <Paper elevation={0} sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
                                <AssessmentOutlinedIcon color="primary" />
                                <Typography component="h2" sx={{ fontWeight: 900 }}>
                                    Últimas ventas
                                </Typography>
                            </Stack>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Hora</TableCell>
                                        <TableCell>Estudiante</TableCell>
                                        <TableCell>Vendedor</TableCell>
                                        <TableCell>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            sx={{ color: "text.secondary", py: 4, textAlign: "center" }}
                                        >
                                            Sin ventas aún
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, xl: 6 }}>
                        <Paper elevation={0} sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
                                <ErrorOutlineOutlinedIcon color="warning" />
                                <Typography component="h2" sx={{ fontWeight: 900 }}>
                                    Alertas
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                sx={{ alignItems: "center", justifyContent: "space-between" }}
                            >
                                <Box>
                                    <Typography sx={{ fontWeight: 900 }}>
                                        Samuel Díaz
                                    </Typography>
                                    <Typography sx={{ color: "text.secondary", fontSize: 14, mt: 0.5 }}>
                                        Saldo bajo · 5°
                                    </Typography>
                                </Box>
                                <Chip
                                    label="$3.200"
                                    sx={{
                                        bgcolor: "#fff0d8",
                                        color: "#e66b00",
                                        fontWeight: 900,
                                    }}
                                />
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Stack>
        </AdminShell>
    );
}
