"use client";

import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import type { VendorDto } from "../schemas/vendor.schema";

type VendorManagerProps = {
    initialVendors: VendorDto[];
};

type FormState = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type NoticeState = {
    message: string;
    severity: "success" | "error";
} | null;

const emptyForm: FormState = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
};

export function VendorManager({ initialVendors }: VendorManagerProps) {
    const [vendors, setVendors] = useState<VendorDto[]>(initialVendors);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notice, setNotice] = useState<NoticeState>(null);

    function handleChange(field: keyof FormState, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    function validate(): boolean {
        const next: Partial<FormState> = {};

        if (form.name.trim().length < 2) {
            next.name = "El nombre debe tener al menos 2 caracteres";
        }
        if (!form.email.includes("@") || form.email.trim().length < 5) {
            next.email = "Correo inválido";
        }
        if (form.password.length < 6) {
            next.password = "Mínimo 6 caracteres";
        }
        if (form.confirmPassword !== form.password) {
            next.confirmPassword = "Las contraseñas no coinciden";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    confirmPassword: form.confirmPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setNotice({ message: data.error ?? "No se pudo crear el vendedor.", severity: "error" });
                return;
            }

            setVendors((prev) => [data.vendor, ...prev]);
            setForm(emptyForm);
            setNotice({ message: `Vendedor "${data.vendor.name}" creado con éxito.`, severity: "success" });
        } catch {
            setNotice({ message: "Error de conexión. Intenta nuevamente.", severity: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 3 }}>
                <GroupsOutlinedIcon sx={{ color: "#28d93d" }} />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Vendedores
                </Typography>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ alignItems: "flex-start" }}>

                {/* ── Formulario ── */}
                <Paper sx={{ p: 3, flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 3 }}>
                        <Typography sx={{ fontWeight: 700 }}>Registra un nuevo vendedor</Typography>
                    </Stack>

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2.5}>
                            <TextField
                                label="Nombre completo"
                                placeholder="Ej: María González"
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                                disabled={isLoading}
                                fullWidth
                            />

                            <TextField
                                label="Email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email ?? "Recibirá notificaciones del sistema"}
                                disabled={isLoading}
                                fullWidth
                            />

                            <TextField
                                label="Contraseña"
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 6 caracteres"
                                value={form.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                error={!!errors.password}
                                helperText={errors.password}
                                disabled={isLoading}
                                fullWidth
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword((v) => !v)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword
                                                        ? <VisibilityOffOutlinedIcon fontSize="small" />
                                                        : <VisibilityOutlinedIcon fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                label="Confirmar contraseña"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Repetir"
                                value={form.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                disabled={isLoading}
                                fullWidth
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirm((v) => !v)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showConfirm
                                                        ? <VisibilityOffOutlinedIcon fontSize="small" />
                                                        : <VisibilityOutlinedIcon fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={isLoading}
                                fullWidth
                                sx={{ bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" } }}
                            >
                                {isLoading ? "Guardando..." : "Guardar"}
                            </Button>
                        </Stack>
                    </form>
                </Paper>

                {/* ── Panel derecho ── */}
                <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>

                    {/* Lista */}
                    <Paper sx={{ p: 3 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
                            <GroupsOutlinedIcon fontSize="small" sx={{ color: "#6d28d9" }} />
                            <Typography sx={{ fontWeight: 700 }}>Vendedores activos</Typography>
                            <Chip
                                label={vendors.length}
                                size="small"
                                sx={{ bgcolor: "#ede9fe", color: "#6d28d9", fontWeight: 700, ml: "auto" }}
                            />
                        </Stack>

                        {vendors.length === 0 ? (
                            <Typography
                                sx={{ color: "text.secondary", textAlign: "center", py: 4 }}
                            >
                                Sin vendedores registrados
                            </Typography>
                        ) : (
                            <Stack divider={<Divider />} spacing={0}>
                                {vendors.map((vendor) => (
                                    <Box key={vendor.id} sx={{ py: 1.5 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                                            {vendor.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                            {vendor.email}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Paper>

                    {/* Info accesos */}
                    <Paper sx={{ p: 3, bgcolor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                            <InfoOutlinedIcon fontSize="small" sx={{ color: "#1d4ed8" }} />
                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1d4ed8' }}>
                                Sobre accesos
                            </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                            Los vendedores solo acceden a Inicio y Registrar Venta.
                            Todos los demás módulos son exclusivos del administrador.
                        </Typography>
                    </Paper>

                </Stack>
            </Stack>

            <Snackbar
                open={!!notice}
                autoHideDuration={4000}
                onClose={() => setNotice(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={notice?.severity}
                    onClose={() => setNotice(null)}
                    variant="filled"
                >
                    {notice?.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}