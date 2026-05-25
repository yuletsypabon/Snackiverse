import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Link from "@/components/link";
import { LogoutButton } from "@/modules/auth/components/logout-button";

const drawerWidth = 284;

const navigation = [
    { icon: HomeOutlinedIcon, label: "Inicio", href: "/dashboard" },
    { icon: PointOfSaleOutlinedIcon, label: "Registrar Venta", href: "/sales" },
    {
        icon: BadgeOutlinedIcon,
        label: "Estudiantes",
        href: "/students",
        section: "ADMINISTRACION",
    },
    { icon: RestaurantMenuOutlinedIcon, label: "Productos", href: "/products" },
    { icon: SavingsOutlinedIcon, label: "Recargas", href: "/recharges" },
    { icon: CreditCardOutlinedIcon, label: "Pagos", href: "/payments" },
    { icon: AssessmentOutlinedIcon, label: "Reportes", href: "/reports" },
    {
        icon: ReceiptLongOutlinedIcon,
        label: "Centro de Informes",
        href: "/reports-center",
    },
    { icon: Inventory2OutlinedIcon, label: "Vendedores", href: "/users" },
    { icon: SecurityOutlinedIcon, label: "Permisos", href: "/permissions" },
];

type AdminShellProps = {
    activeHref: string;
    children: React.ReactNode;
};

export function AdminShell({ activeHref, children }: AdminShellProps) {
    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Box
                component="aside"
                sx={{
                    bgcolor: "#2d4254",
                    borderRight: "1px solid #15202b",
                    color: "white",
                    display: { xs: "none", lg: "flex" },
                    flexDirection: "column",
                    height: "100vh",
                    left: 0,
                    position: "fixed",
                    top: 0,
                    width: drawerWidth,
                    zIndex: 20,
                }}
            >
                <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                        alignItems: "center",
                        bgcolor: "#17232d",
                        borderBottom: "1px solid #15202b",
                        minHeight: 102,
                        px: 2.5,
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: "white",
                            borderRadius: 1,
                            display: "grid",
                            fontSize: 28,
                            height: 50,
                            placeItems: "center",
                            width: 38,
                        }}
                    >
                        🌭
                    </Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                        Snackie
                        <Box component="span" sx={{ color: "#2ecc71" }}>
                            Verse
                        </Box>
                    </Typography>
                </Stack>

                <Stack
                    direction="row"
                    sx={{
                        alignItems: "center",
                        bgcolor: "#17232d",
                        borderBottom: "1px solid #15202b",
                        minHeight: 56,
                        px: 2,
                    }}
                >
                    <Typography sx={{ flexGrow: 1, fontSize: 14, fontWeight: 900 }}>
                        Administrador
                    </Typography>
                    <Chip
                        label="admin"
                        size="small"
                        sx={{
                            bgcolor: "#198754",
                            color: "white",
                            fontSize: 11,
                            fontWeight: 900,
                        }}
                    />
                </Stack>

                <List disablePadding sx={{ flexGrow: 1, py: 1 }}>
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = item.href === activeHref;

                        return (
                            <Box key={item.label}>
                                {item.section && (
                                    <Typography
                                        sx={{
                                            color: "#8fa1b2",
                                            fontSize: 12,
                                            fontWeight: 900,
                                            letterSpacing: "0.16em",
                                            px: 2,
                                            pb: 1,
                                            pt: 2.5,
                                        }}
                                    >
                                        {item.section}
                                    </Typography>
                                )}

                                <ListItemButton
                                    component={Link}
                                    href={item.href}
                                    selected={active}
                                    sx={{
                                        color: "white",
                                        minHeight: 53,
                                        px: 2.25,
                                        "&.Mui-selected": {
                                            bgcolor: "rgba(255,255,255,0.1)",
                                            color: "white",
                                        },
                                        "&.Mui-selected:hover": {
                                            bgcolor: "rgba(255,255,255,0.14)",
                                        },
                                        "&:hover": {
                                            bgcolor: "rgba(255,255,255,0.08)",
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                                        <Icon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        slotProps={{
                                            primary: {
                                                sx: {
                                                    fontSize: 15,
                                                    fontWeight: 800,
                                                },
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            </Box>
                        );
                    })}
                </List>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
                <Box sx={{ px: 2, py: 2 }}>
                    <LogoutButton />
                </Box>
            </Box>

            <Box
                component="main"
                sx={{
                    minHeight: "100vh",
                    ml: { lg: `${drawerWidth}px` },
                    px: { xs: 2, sm: 3.5 },
                    py: { xs: 3, sm: 4.5 },
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
