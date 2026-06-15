"use client";

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);

        await fetch("/api/auth/logout", {
        method: "POST",
        });

        router.replace("/login");
        router.refresh();
    };

    return (
        <Button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            color="error"
            startIcon={loading ? <CircularProgress size={20} sx={{ color: "inherit" }} /> : <LogoutOutlinedIcon />}
            sx={{
                fontWeight: 900,
                justifyContent: "flex-start",
                px: 0,
            }}
        >
            {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Saliendo...
                </Box>
            ) : (
                "Salir"
            )}
        </Button>
    );
}
