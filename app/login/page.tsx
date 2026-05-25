import { Box } from "@mui/material";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function LoginPage() {
    return (
        <Box
            component="main"
            sx={{
                display: "grid",
                placeItems: "center",
                minHeight: "100vh",
                bgcolor: "#17313b",
                p: { xs: 2, sm: 3, lg: 5 },
            }}
        >
            <LoginForm />
        </Box>
    );
}

