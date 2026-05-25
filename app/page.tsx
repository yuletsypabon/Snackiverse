import { Box, Typography, Stack } from "@mui/material";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function HomePage() {
  return (
    <Box
      component="main"
      sx={{
        p: 4,
      }}
    >
      <Stack spacing={3}>
        <Typography
          component="h1"
          sx={{
            fontSize: 28,
            fontWeight: 900,
            color: "#0a2540",
          }}
        >
          SnackieVerse
        </Typography>
        <LoginForm />
      </Stack>
    </Box>
  );
}