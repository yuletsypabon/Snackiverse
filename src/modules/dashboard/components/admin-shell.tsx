"use client";

import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useState } from "react";

import Link from "@/components/link";
import { LogoutButton } from "@/modules/auth/components/logout-button";

const DRAWER_WIDTH = 284;
const COLLAPSED_WIDTH = 72;

const navigation = [
    { icon: HomeOutlinedIcon, label: "Inicio", href: "/dashboard" },
    { icon: PointOfSaleOutlinedIcon, label: "Registrar Venta", href: "/sales" },
    { icon: BadgeOutlinedIcon, label: "Estudiantes", href: "/students", section: "ADMINISTRACION" },
    { icon: RestaurantMenuOutlinedIcon, label: "Productos", href: "/products" },
    { icon: CategoryOutlinedIcon, label: "Catálogo y Etiquetas", href: "/catalog" },
    { icon: SavingsOutlinedIcon, label: "Recargas", href: "/recharges" },
    { icon: CreditCardOutlinedIcon, label: "Pagos", href: "/payments" },
    { icon: AssessmentOutlinedIcon, label: "Centro de Informes", href: "/reports-center" },
    { icon: GroupsOutlinedIcon, label: "Vendedores", href: "/users" },
];

type AdminShellProps = {
    activeHref: string;
    children: React.ReactNode;
};

function SidebarContent({ activeHref, collapsed, onToggle }: { activeHref: string; collapsed: boolean; onToggle: () => void }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Logo + botón toggle */}
            <Stack direction="row" sx={{
                alignItems: "center",
                bgcolor: "#17232d",
                borderBottom: "1px solid #15202b",
                minHeight: 102,
                px: collapsed ? 1 : 2.5,
                justifyContent: collapsed ? "center" : "flex-start",
                overflow: "hidden",
                position: "relative",
            }}>
                <Image
                    src="/logo/dashboard.png"
                    alt="SnackieVerse"
                    width={collapsed ? 44 : 70}
                    height={collapsed ? 44 : 70}
                    priority
                    style={{ objectFit: "contain", flexShrink: 0 }}
                />
                {!collapsed && (
                    <Tooltip title="Colapsar menú" placement="right">
                        <IconButton
                            onClick={onToggle}
                            size="small"
                            sx={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "rgba(255,255,255,0.5)",
                                "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.08)" },
                            }}
                        >
                            <ChevronLeftIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {collapsed && (
                    <Tooltip title="Expandir menú" placement="right">
                        <IconButton
                            onClick={onToggle}
                            size="small"
                            sx={{
                                mt: 1,
                                color: "rgba(255,255,255,0.5)",
                                "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.08)" },
                            }}
                        >
                            <ChevronRightIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>

            {/* Usuario */}
            {!collapsed && (
                <Stack direction="row" sx={{
                    alignItems: "center",
                    bgcolor: "#17232d",
                    borderBottom: "1px solid #15202b",
                    minHeight: 56,
                    px: 2,
                }}>
                    <Typography sx={{ flexGrow: 1, fontSize: 14, fontWeight: 900 }}>
                        Administrador
                    </Typography>
                    <Chip label="admin" size="small"
                        sx={{ bgcolor: "#198754", color: "white", fontSize: 11, fontWeight: 900 }} />
                </Stack>
            )}

            {/* Navegación */}
            <List disablePadding sx={{ flexGrow: 1, py: 1, overflowY: "auto", overflowX: "hidden" }}>
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = item.href === activeHref;
                    return (
                        <Box key={item.label}>
                            {item.section && !collapsed && (
                                <Typography sx={{
                                    color: "#8fa1b2", fontSize: 12, fontWeight: 900,
                                    letterSpacing: "0.16em", px: 2, pb: 1, pt: 2.5,
                                }}>
                                    {item.section}
                                </Typography>
                            )}
                            {item.section && collapsed && <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", my: 1 }} />}

                            <Tooltip title={collapsed ? item.label : ""} placement="right">
                                <ListItemButton
                                    component={Link}
                                    href={item.href}
                                    selected={active}
                                    sx={{
                                        color: "white",
                                        minHeight: 48,
                                        px: collapsed ? 0 : 2.25,
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.1)", color: "white" },
                                        "&.Mui-selected:hover": { bgcolor: "rgba(255,255,255,0.14)" },
                                        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        color: "inherit",
                                        minWidth: collapsed ? 0 : 36,
                                        justifyContent: "center",
                                    }}>
                                        <Icon fontSize="small" />
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <ListItemText
                                            primary={item.label}
                                            slotProps={{ primary: { sx: { fontSize: 15, fontWeight: 800 } } }}
                                        />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        </Box>
                    );
                })}
            </List>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
            <Box sx={{ px: collapsed ? 1 : 2, py: 2, display: "flex", justifyContent: collapsed ? "center" : "flex-start" }}>
                {collapsed ? (
                    <Tooltip title="Salir" placement="right">
                        <Box sx={{ display: "flex" }}>
                            <LogoutButton />
                        </Box>
                    </Tooltip>
                ) : (
                    <LogoutButton />
                )}
            </Box>
        </Box>
    );
}

export function AdminShell({ activeHref, children }: AdminShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const desktopWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>

            {/* AppBar móvil */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    display: { lg: "none" },
                    bgcolor: "#17232d",
                    borderBottom: "1px solid #15202b",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setMobileOpen(true)}
                        sx={{ mr: 1.5 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Image src="/logo/dashboard.png" alt="SnackieVerse" width={36} height={36} style={{ objectFit: "contain" }} />
                    <Typography sx={{ ml: 1.5, fontWeight: 900, fontSize: 16, flexGrow: 1 }}>
                        SnackieVerse
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Drawer temporal (móvil) */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", lg: "none" },
                    "& .MuiDrawer-paper": {
                        width: DRAWER_WIDTH,
                        bgcolor: "#2d4254",
                        color: "white",
                        boxSizing: "border-box",
                    },
                }}
            >
                <SidebarContent
                    activeHref={activeHref}
                    collapsed={false}
                    onToggle={() => setMobileOpen(false)}
                />
            </Drawer>

            {/* Sidebar fijo (desktop) */}
            <Box
                component="aside"
                sx={{
                    bgcolor: "#2d4254",
                    color: "white",
                    display: { xs: "none", lg: "flex" },
                    flexDirection: "column",
                    height: "100vh",
                    left: 0,
                    position: "fixed",
                    top: 0,
                    width: desktopWidth,
                    zIndex: 20,
                    transition: "width 0.22s ease",
                    overflow: "hidden",
                    boxShadow: "6px 0 24px rgba(0,0,0,0.28)",
                }}
            >
                <SidebarContent
                    activeHref={activeHref}
                    collapsed={collapsed}
                    onToggle={() => setCollapsed((v) => !v)}
                />
            </Box>

            {/* Contenido principal */}
            <Box
                component="main"
                sx={{
                    minHeight: "100vh",
                    ml: { lg: `${desktopWidth}px` },
                    transition: "margin-left 0.22s ease",
                    paddingTop: { xs: "72px", lg: "32px" },
                    paddingBottom: { xs: "20px", sm: "32px" },
                    paddingLeft: { xs: "14px", sm: "24px" },
                    paddingRight: { xs: "14px", sm: "24px" },
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
