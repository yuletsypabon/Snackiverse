"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "vendor">("admin"); // Default role, can be changed to "vendor" as needed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }

      router.replace(data.user.role === "admin" ? "/dashboard" : "/sales");
      // window.location.href = "/dashboard";
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#17313b",
      padding: "16px",
      overflowY: "auto",
      boxSizing: "border-box",
    }}>
    <Box
      sx={{
        display: "grid",
        width: "100%",
        maxWidth: "1030px",
        overflow: "hidden",
        borderRadius: "28px",
        bgcolor: "white",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        gridTemplateColumns: { xs: "1fr", lg: "1.08fr 0.92fr" },
        minHeight: { xs: "auto", lg: "558px" },
      }}
    >
      {/* Sidebar izquierdo - Selección de rol */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #073818 0%, #17632f 50%, #25a957 100%)",
          px: { xs: 3, sm: 4 },
          py: 5,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          spacing={4}
          sx={{
            width: "100%",
            minHeight: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: "100%",
              maxWidth: 360,
                height: "100%",
            }}
          >
            <Image
              src="/logo/adminpanel.png"
              alt="Snackie Verse Logo"
              width={340}
              height={260}
              priority
              style={{ objectFit: "contain" }}
            />
          </Box>

          {/* Descripción */}
          <Typography
            sx={{
              width: "80%",
              maxWidth: 300,
              textAlign: "center",
              alignSelf: "center",
              fontSize: 12,
              fontWeight: 600,
              height: "100%",
              textTransform: "uppercase",
              color: "#d1d5db",
              fontStyle: "Bold Condensed Italic",
            }}
          >
            Sistema de gestión de cafetería escolar
          </Typography>

          {/* Botones de selección de rol */}
          
        </Stack>
      </Box>

      {/* Lado derecho - Formulario de login */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, sm: 4 },
          py: 5,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", maxWidth: "360px" }}
        >
          {/* Título */}
          <Box sx={{ mb: 4.5, textAlign: "center" }}>
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#5f6f7d",
              }}
            >
              Bienvenido
            </Typography>
            <Typography
              sx={{
                mt: 1.5,
                fontSize: 32,
                fontWeight: 900,
              }}
            >
              Iniciar sesión
            </Typography>
          </Box>

          {/* Selector de rol */}
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(event, newRole) => {
              if (newRole) setRole(newRole);
            }}
            fullWidth
            sx={{
              mb: 3,
              bgcolor: "#f1f5f9",
              borderRadius: "12px",
              p: "4px",
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 900,
                fontSize: "14px",
                borderRadius: "10px",
                border: "none",
                color: "#5f6f7d",
                "&.Mui-selected": {
                  bgcolor: "white",
                  color: "#0a2540",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    bgcolor: "white",
                  },
                },
              },
            }}
          >
            <ToggleButton value="admin" sx={{ flex: 1, gap: 1, display: "flex", alignItems: "center" }}>
              <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20 }} />
              Admin
            </ToggleButton>
            <ToggleButton value="vendor" sx={{ flex: 1, gap: 1, display: "flex", alignItems: "center" }}>
              <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
              Vendedor
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Input Email */}
          <TextField
            type="email"
            placeholder="Usuario"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "#94a3b8", mr: 1 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                height: "54px",
                borderRadius: "12px",
                "& fieldset": {
                  borderColor: "#cbd5e1",
                  borderWidth: "2px",
                },
                "&:hover fieldset": {
                  borderColor: "#cbd5e1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#10b981",
                  borderWidth: "2px",
                },
              },
              "& .MuiOutlinedInput-input": {
                color: "#1e293b",
                fontSize: "16px",
                "&::placeholder": {
                  color: "#94a3b8",
                  opacity: 1,
                },
              },
            }}
          />

          {/* Input Contraseña */}
          <TextField
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#94a3b8", mr: 1 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                height: "54px",
                borderRadius: "12px",
                "& fieldset": {
                  borderColor: "#cbd5e1",
                  borderWidth: "2px",
                },
                "&:hover fieldset": {
                  borderColor: "#cbd5e1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#10b981",
                  borderWidth: "2px",
                },
              },
              "& .MuiOutlinedInput-input": {
                color: "#1e293b",
                fontSize: "16px",
                "&::placeholder": {
                  color: "#94a3b8",
                  opacity: 1,
                },
              },
            }}
          />

          {/* Alert de error */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: "12px" }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          {/* Botón de envío */}
          <Button
            type="submit"
            disabled={loading}
            fullWidth
            variant="contained"
            sx={{
              height: "56px",
              borderRadius: "12px",
              fontSize: 18,
              fontWeight: 900,
              background: "linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)",
              boxShadow: "0 10px 25px rgba(46, 204, 113, 0.3)",
              textTransform: "none",
              color: "white",
              "&:disabled": {
                opacity: 0.6,
                background: "linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)",
              },
              "&:hover:not(:disabled)": {
                boxShadow: "0 15px 35px rgba(46, 204, 113, 0.4)",
              },
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={24} sx={{ color: "white" }} />
                Ingresando...
              </Box>
            ) : (
              "Ingresar"
            )}
          </Button>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            
            <Typography
              sx={{ mt: 1, fontSize: "12px", color: "#94a3b8" }}>
              Contacta al administrador si olvidaste tu contraseña
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
    </div>
  );
}
