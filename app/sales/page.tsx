import { Box, Typography } from "@mui/material";

export default function SalesPage() {
    return (
        <Box
            component="main"
            sx={{
                minHeight: "100vh",
                bgcolor: "#edf2f8",
                px: 3,
                py: 4,
                color: "#020617",
            }}
        >
            <Typography
                component="h1"
                sx={{
                    fontSize: 32,
                    fontWeight: 900,
                }}
            >
                Registrar venta
            </Typography>
            <Typography
                sx={{
                    mt: 1,
                    color: "#475569",
                }}
            >
                Vista permitida para vendedores.
            </Typography>
        </Box>
    );
}